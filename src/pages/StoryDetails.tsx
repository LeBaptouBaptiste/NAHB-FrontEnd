import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Star, Eye, User, Trophy, PlayCircle } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { storyService, gameService } from "../api/services";
import type { Story } from "../api/services";

export function StoryDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
        loadStory(id);
    }
  }, [id]);

  const loadStory = async (storyId: string) => {
    try {
        setLoading(true);
        const data = await storyService.getStory(storyId);
        setStory(data);
    } catch (error) {
        console.error("Failed to load story:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!story) return;
    try {
        const session = await gameService.startSession(story._id);
        navigate(`/play/${session._id}`);
    } catch (error) {
        console.error("Failed to start game session:", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!story) return <div className="min-h-screen flex items-center justify-center">Story not found</div>;

  const mockImageUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2Mzk5NjkzMXww&ixlib=rb-4.1.0&q=80&w=1080";

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12">
        {/* Hero Image */}
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-8">
          <ImageWithFallback 
            src={story.imageUrl || mockImageUrl}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {story.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-card/80 backdrop-blur-sm">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="mb-2">{story.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Author ID: {story.authorId.substring(0, 8)}...</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>4.5</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{(story.stats?.views || 0).toLocaleString()} plays</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span>{Object.keys(story.stats?.endings || {}).length} endings</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {story.description}
                </p>
              </CardContent>
            </Card>

            {/* Endings (Placeholder logic for now as we don't have unlocked status per user yet) */}
            <Card>
              <CardHeader>
                <CardTitle>Endings Discovered</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-muted-foreground text-sm">
                    {Object.keys(story.stats?.endings || {}).length > 0 
                        ? `${Object.keys(story.stats?.endings || {}).length} unique endings discovered by players.`
                        : "No endings discovered yet. Be the first!"
                    }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Button 
              size="lg" 
              className="w-full gap-2"
              onClick={handleStartGame}
            >
              <PlayCircle className="w-5 h-5" />
              Start Adventure
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>Story Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span>
                        {story.stats?.views > 0 
                            ? Math.round(((story.stats?.completions || 0) / story.stats.views) * 100) 
                            : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary" 
                        style={{ width: `${story.stats?.views > 0 ? Math.round(((story.stats?.completions || 0) / story.stats.views) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About the Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span>AU</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Author {story.authorId.substring(0, 6)}</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
