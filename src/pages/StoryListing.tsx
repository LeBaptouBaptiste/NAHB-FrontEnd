import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { StoryCard } from "../components/StoryCard";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { storyService } from "../api/services";
import type { Story } from "../api/services";

const allTags = ["Fantasy", "Sci-Fi", "Mystery", "Horror", "Adventure", "Romance", "Thriller", "Cyberpunk", "Magic", "Space"];

export function StoryListing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, [searchQuery]); // Reload when search changes (debouncing would be better in prod)

  const loadStories = async () => {
    try {
      setLoading(true);
      const data = await storyService.getPublishedStories(searchQuery);
      setStories(data);
    } catch (error) {
      console.error("Failed to load published stories:", error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-2">Discover Stories</h1>
          <p className="text-muted-foreground">
            Browse through thousands of interactive adventures
          </p>
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
                className="pl-10 bg-input border-border/50"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Tag Filter */}
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Story Grid */}
        {loading ? (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map(story => (
                // StoryCard props might need adjustment if interfaces mismatch
                <StoryCard
                key={story._id}
                id={story._id}
                title={story.title}
                description={story.description}
                tags={story.tags}
                rating={4.5} // Mock rating
                plays={story.stats?.views || 0}
                author={story.authorId} // Should ideally fetch author name
                imageUrl={story.imageUrl || "https://images.unsplash.com/photo-1534447677768-be436bb09401?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2Mzk5NjkzMXww&ixlib=rb-4.1.0&q=80&w=1080"}
                onClick={() => navigate(`/story/${story._id}`)}
                />
          ))}
        </div>
        )}

        {!loading && filteredStories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No stories found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
