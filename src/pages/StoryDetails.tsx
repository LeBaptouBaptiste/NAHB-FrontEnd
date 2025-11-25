import { useNavigate, useParams } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Star, Eye, User, Trophy } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function StoryDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data - would come from API
  const story = {
    id: id || "1",
    title: "The Forgotten Realm",
    description: "Journey through a mystical land where ancient magic still lingers and every choice shapes your destiny. In this epic adventure, you'll encounter powerful wizards, fearsome dragons, and make decisions that will determine the fate of entire kingdoms.",
    author: "Sarah Chen",
    tags: ["Fantasy", "Adventure", "Magic"],
    rating: 4.8,
    plays: 12453,
    totalEndings: 8,
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2Mzk5NjkzMXww&ixlib=rb-4.1.0&q=80&w=1080",
  };

  const unlockedEndings = [
    { id: 1, name: "Heroic Victory", unlocked: true, rarity: "Common" },
    { id: 2, name: "Dark Alliance", unlocked: true, rarity: "Rare" },
    { id: 3, name: "Peaceful Resolution", unlocked: true, rarity: "Uncommon" },
    { id: 4, name: "True Mage", unlocked: false, rarity: "Legendary" },
    { id: 5, name: "Dragon Rider", unlocked: false, rarity: "Epic" },
    { id: 6, name: "Betrayer's Path", unlocked: false, rarity: "Rare" },
    { id: 7, name: "Sacrifice", unlocked: false, rarity: "Uncommon" },
    { id: 8, name: "Hidden Ascension", unlocked: false, rarity: "Legendary" },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common": return "bg-gray-500";
      case "Uncommon": return "bg-green-500";
      case "Rare": return "bg-blue-500";
      case "Epic": return "bg-purple-500";
      case "Legendary": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12">
        {/* Hero Image */}
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-8">
          <ImageWithFallback 
            src={story.imageUrl}
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
                <span>{story.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>{story.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{story.plays.toLocaleString()} plays</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span>{story.totalEndings} endings</span>
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

            {/* Endings */}
            <Card>
              <CardHeader>
                <CardTitle>Endings ({unlockedEndings.filter(e => e.unlocked).length}/{story.totalEndings} Unlocked)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unlockedEndings.map(ending => (
                    <div
                      key={ending.id}
                      className={`p-4 rounded-lg border ${
                        ending.unlocked 
                          ? 'border-primary/50 bg-primary/5' 
                          : 'border-border/50 bg-muted/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={ending.unlocked ? '' : 'blur-sm select-none'}>
                          {ending.name}
                        </span>
                        {ending.unlocked && (
                          <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${getRarityColor(ending.rarity)} text-white`}>
                        {ending.rarity}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => navigate(`/read/${story.id}`)}
            >
              Start Reading
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>Story Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[68%] bg-gradient-to-r from-primary to-secondary" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Average Rating</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      {story.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Time</span>
                    <span>2-3 hours</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty</span>
                    <span>Medium</span>
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
                    <span>SC</span>
                  </div>
                  <div>
                    <div>{story.author}</div>
                    <div className="text-sm text-muted-foreground">12 stories published</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
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
