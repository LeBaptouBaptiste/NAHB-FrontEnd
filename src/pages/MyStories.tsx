import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  GitBranch,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { storyService, ratingService } from "../api/services";
import type { Story } from "../api/services";

export function MyStories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const data = await storyService.getMyStories();
      setStories(data);

      // Fetch ratings for all stories
      await loadRatings(data);
    } catch (error) {
      console.error("Failed to load stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async (storyList: Story[]) => {
    const ratingsMap: Record<string, number> = {};

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

  const handleDelete = (id: string) => {
    setStoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (storyToDelete) {
      try {
        await storyService.deleteStory(storyToDelete);
        setStories(stories.filter(s => s._id !== storyToDelete));
      } catch (error) {
        console.error("Failed to delete story:", error);
      } finally {
        setDeleteDialogOpen(false);
        setStoryToDelete(null);
      }
    }
  };

  const togglePublish = async (story: Story) => {
    try {
      const newStatus = story.status === "published" ? "draft" : "published";
      const updatedStory = await storyService.updateStory(story._id, { status: newStatus });
      setStories(stories.map(s => s._id === story._id ? updatedStory : s));
    } catch (error) {
      console.error("Failed to update story status:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalPlays = () => stories.reduce((sum, s) => sum + (s.stats?.views || 0), 0);

  const getAvgRating = () => {
    const ratingValues = Object.values(ratings).filter(r => r > 0);
    if (ratingValues.length === 0) return "N/A";
    const avg = ratingValues.reduce((sum, r) => sum + r, 0) / ratingValues.length;
    return avg.toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading stories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">My Stories</h1>
            <p className="text-muted-foreground">
              Create and manage your interactive adventures
            </p>
          </div>

          <Button
            className="gap-2"
            onClick={() => navigate("/editor/new")}
          >
            <Plus className="w-4 h-4" />
            New Story
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stories.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total Plays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {getTotalPlays().toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {getAvgRating()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stories List */}
        <div className="space-y-4">
          {stories.map(story => (
            <Card key={story._id} className="hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{story.title}</CardTitle>
                      <Badge variant={story.status === "published" ? "default" : "secondary"}>
                        {story.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last edited {formatDate(story.updatedAt)}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/editor/${story._id}`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/editor/${story._id}/flow`)}>
                        <GitBranch className="w-4 h-4 mr-2" />
                        View Flow
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublish(story)}>
                        {story.status === "published" ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(story._id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span>{(story.stats?.views || 0).toLocaleString()} plays</span>
                  </div>

                  {/* Rating placeholder */}
                  {/* 
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>4.5 rating</span>
                    </div>
                  */}

                  <div className="flex items-center gap-2 text-sm">
                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                    <span>{Object.keys(story.stats?.endings || {}).length} endings</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{story.stats?.completions || 0} completions</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/50 pt-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/editor/${story._id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/editor/${story._id}/flow`)}
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  View Flow
                </Button>
                {story.status === "published" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/story/${story._id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {stories.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You haven't created any stories yet.
              </p>
              <Button onClick={() => navigate("/editor/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Story
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your story. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
