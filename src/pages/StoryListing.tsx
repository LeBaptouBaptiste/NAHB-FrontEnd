import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../components/templates/MainLayout";
import { StoryCard } from "../components/molecules/StoryCard";
import { Input } from "../components/atoms/input";
import { Button } from "../components/atoms/button";
import { Badge } from "../components/atoms/badge";
import { Search, SlidersHorizontal, Loader2, Library, Upload } from "lucide-react";
import { storyService, ratingService, migrationService } from "../api/services";
import type { Story } from "../api/services";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/atoms/dropdown-menu";
import { toast } from "sonner";

export function StoryListing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    loadStories();
    loadTags();
  }, [searchQuery]); // Reload when search changes (debouncing would be better in prod)

  const loadTags = async () => {
    try {
      const tags = await storyService.getTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  };

  const loadStories = async () => {
    try {
      setLoading(true);
      const data = await storyService.getPublishedStories(searchQuery);
      setStories(data);

      // Fetch ratings for all stories
      await loadRatings(data);
    } catch (error) {
      console.error("Failed to load published stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async (storyList: Story[]) => {
    const ratingsMap: Record<string, number> = {};

    // Fetch ratings in parallel for better performance
    await Promise.all(
      storyList.map(async (story) => {
        try {
          const data = await ratingService.getStoryRatings(story._id, 1, 1);
          ratingsMap[story._id] = data.stats.averageScore || 0;
        } catch (error) {
          console.error(`Failed to load ratings for story ${story._id}:`, error);
          ratingsMap[story._id] = 0;
        }
      })
    );

    setRatings(ratingsMap);
  };

  const handleExport = async (storyId: string, title: string) => {
    try {
      const blob = await migrationService.exportStory(storyId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Story exported successfully!");
    } catch (error) {
      console.error("Failed to export story:", error);
      toast.error("Failed to export story.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setLoading(true);
        await migrationService.importStory(file);
        toast.success("Story imported successfully!");
        loadStories(); // Reload list
      } catch (error: any) {
        console.error("Failed to import story:", error);
        toast.error(error.response?.data?.message || "Failed to import story.");
      } finally {
        setLoading(false);
        // Reset input
        e.target.value = '';
      }
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredStories = stories.filter(story => {
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => story.tags.includes(tag));
    return matchesTags;
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <Library className="w-8 h-8 text-emerald-500" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Library
              </h1>
            </div>
            <p className="text-muted-foreground text-lg ml-1">
              Browse through thousands of interactive adventures
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <input
                type="file"
                accept=".zip"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImport}
              />
              <Button variant="outline" className="gap-2 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500">
                <Upload className="w-4 h-4" />
                Import Story
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 backdrop-blur-sm border-white/10 hover:border-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-500 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
                <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableTags.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">No tags available</div>
                ) : (
                  availableTags.map(tag => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-500 data-[highlighted]:bg-emerald-500/10 data-[highlighted]:text-emerald-500 transition-colors"
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <Badge
                  key={tag}
                  variant="default"
                  className="cursor-pointer transition-all bg-gradient-to-r from-emerald-600 to-green-600 text-white border-transparent hover:from-emerald-700 hover:to-green-700 shadow-md pr-1"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  <span className="ml-1 hover:bg-white/20 rounded-full p-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </span>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedTags([])}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Story Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map(story => (
              <StoryCard
                key={story._id}
                id={story._id}
                title={story.title}
                description={story.description}
                tags={story.tags}
                rating={ratings[story._id] || 0}
                plays={story.stats?.views || 0}
                author={story.authorId}
                imageUrl={story.imageUrl || "https://images.unsplash.com/photo-1534447677768-be436bb09401?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2Mzk5NjkzMXww&ixlib=rb-4.1.0&q=80&w=1080"}
                onClick={() => navigate(`/story/${story._id}`)}
                onExport={() => handleExport(story._id, story.title)}
              />
            ))}
          </div>
        )}

        {!loading && filteredStories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No stories found matching your criteria.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
