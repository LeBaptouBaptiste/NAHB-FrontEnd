import { useState } from "react";
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
  Star, 
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

interface Story {
  id: string;
  title: string;
  status: "draft" | "published";
  plays: number;
  rating: number;
  totalEndings: number;
  endingsReached: number;
  lastEdited: string;
}

const mockStories: Story[] = [
  {
    id: "1",
    title: "The Forgotten Realm",
    status: "published",
    plays: 12453,
    rating: 4.8,
    totalEndings: 8,
    endingsReached: 6,
    lastEdited: "2 days ago",
  },
  {
    id: "2",
    title: "Shadows of Tomorrow",
    status: "published",
    plays: 5432,
    rating: 4.5,
    totalEndings: 5,
    endingsReached: 4,
    lastEdited: "1 week ago",
  },
  {
    id: "3",
    title: "Untitled Story",
    status: "draft",
    plays: 0,
    rating: 0,
    totalEndings: 3,
    endingsReached: 0,
    lastEdited: "3 hours ago",
  },
];

export function MyStories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState(mockStories);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setStoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (storyToDelete) {
      setStories(stories.filter(s => s.id !== storyToDelete));
      setDeleteDialogOpen(false);
      setStoryToDelete(null);
    }
  };

  const togglePublish = (id: string) => {
    setStories(stories.map(story => 
      story.id === id 
        ? { ...story, status: story.status === "published" ? "draft" : "published" }
        : story
    ));
  };

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
                {stories.reduce((sum, s) => sum + s.plays, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {(stories.reduce((sum, s) => sum + s.rating, 0) / stories.filter(s => s.rating > 0).length).toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stories List */}
        <div className="space-y-4">
          {stories.map(story => (
            <Card key={story.id} className="hover:border-primary/50 transition-all">
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
                      Last edited {story.lastEdited}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/editor/${story.id}`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/editor/${story.id}/flow`)}>
                        <GitBranch className="w-4 h-4 mr-2" />
                        View Flow
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublish(story.id)}>
                        {story.status === "published" ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(story.id)}
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
                    <span>{story.plays.toLocaleString()} plays</span>
                  </div>
                  
                  {story.rating > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{story.rating.toFixed(1)} rating</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                    <span>{story.totalEndings} endings</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{story.endingsReached}/{story.totalEndings} reached</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t border-border/50 pt-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/editor/${story.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/editor/${story.id}/flow`)}
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  View Flow
                </Button>
                {story.status === "published" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/story/${story.id}`)}
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
