import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { StoryCard } from "../components/StoryCard";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Search, SlidersHorizontal } from "lucide-react";

const mockStories = [
  {
    id: "1",
    title: "The Forgotten Realm",
    description: "Journey through a mystical land where ancient magic still lingers and every choice shapes your destiny.",
    tags: ["Fantasy", "Adventure", "Magic"],
    rating: 4.8,
    plays: 12453,
    author: "Sarah Chen",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2Mzk5NjkzMXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "2",
    title: "Cybernetic Dreams",
    description: "In a neon-lit future, you must navigate corporate espionage and digital consciousness.",
    tags: ["Sci-Fi", "Cyberpunk", "Thriller"],
    rating: 4.6,
    plays: 9876,
    author: "Alex Morgan",
    imageUrl: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBjaXR5fGVufDF8fHx8MTc2Mzk1MTE5NXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "3",
    title: "Whispers in the Woods",
    description: "A mysterious forest holds secrets that could change everything you know about reality.",
    tags: ["Mystery", "Horror", "Supernatural"],
    rating: 4.9,
    plays: 15234,
    author: "Emma Thompson",
    imageUrl: "https://images.unsplash.com/photo-1641657381836-ff76cd128d37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwZm9yZXN0fGVufDF8fHx8MTc2Mzk5NjkzMnww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "4",
    title: "Starship Odyssey",
    description: "Captain a starship through unknown space, making decisions that will affect your crew's survival.",
    tags: ["Sci-Fi", "Space", "Adventure"],
    rating: 4.7,
    plays: 11234,
    author: "Marcus Reed",
    imageUrl: "https://images.unsplash.com/photo-1536685632249-7e210d6e381e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGFjZSUyMGFkdmVudHVyZXxlbnwxfHx8fDE3NjM5OTY5MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "5",
    title: "Kingdom of Shadows",
    description: "Navigate political intrigue and dark magic in a medieval kingdom on the brink of war.",
    tags: ["Fantasy", "Political", "Drama"],
    rating: 4.5,
    plays: 8765,
    author: "Victoria Cross",
    imageUrl: "https://images.unsplash.com/photo-1485465053475-dd55ed3894b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpZXZhbCUyMGNhc3RsZXxlbnwxfHx8fDE3NjM5NTY2OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "6",
    title: "The Last Artifact",
    description: "Race against time to find an ancient artifact before it falls into the wrong hands.",
    tags: ["Adventure", "Action", "Mystery"],
    rating: 4.4,
    plays: 7654,
    author: "James Park",
    imageUrl: "https://images.unsplash.com/photo-1517239320384-e08ad2c24a3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwY2F2ZXxlbnwxfHx8fDE3NjM5OTY5MzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

const allTags = ["Fantasy", "Sci-Fi", "Mystery", "Horror", "Adventure", "Romance", "Thriller", "Cyberpunk", "Magic", "Space"];

export function StoryListing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredStories = mockStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => story.tags.includes(tag));
    return matchesSearch && matchesTags;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map(story => (
            <StoryCard
              key={story.id}
              {...story}
              onClick={() => navigate(`/story/${story.id}`)}
            />
          ))}
        </div>

        {filteredStories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No stories found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
