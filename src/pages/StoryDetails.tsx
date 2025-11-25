import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Star, Eye, User, Trophy, PlayCircle, Flag } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  storyService,
  gameService,
  favoriteService,
  ratingService,
  reportService,
} from "../api/services";
import type { Story, Rating, RatingsResponse, ReportType } from "../api/services";
import { Textarea } from "../components/ui/textarea";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useAuth } from "../context/AuthContext";

export function StoryDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { user } = useAuth();

  const [ratingsData, setRatingsData] = useState<RatingsResponse | null>(null);
  const [myRating, setMyRating] = useState<Rating | null>(null);
  const [userScore, setUserScore] = useState<number>(0);
  const [userComment, setUserComment] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("inappropriate_content");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadStory(id);
      checkFavoriteStatus(id);
      loadRatings(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const loadRatings = async (storyId: string) => {
    try {
      const data = await ratingService.getStoryRatings(storyId);
      setRatingsData(data);
    } catch (error) {
      console.error("Failed to load ratings:", error);
    }

    // Rating de l'utilisateur courant (si connecté)
    if (user) {
      try {
        const mine = await ratingService.getMyRating(storyId);
        setMyRating(mine);
        if (mine) {
          setUserScore(mine.score);
          setUserComment(mine.comment || "");
        }
      } catch (error) {
        console.error("Failed to load user rating:", error);
      }
    }
  };

  const checkFavoriteStatus = async (storyId: string) => {
    try {
      const { favorited } = await favoriteService.checkFavorite(storyId);
      setIsFavorited(favorited);
    } catch (error) {
      console.error("Failed to check favorite status:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!id) return;
    try {
      setFavoriteLoading(true);
      const { favorited } = await favoriteService.toggleFavorite(id);
      setIsFavorited(favorited);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!story) return;
    try {
      const session = await gameService.startSession(story._id);
      navigate(`/play/${session._id}`);
    } catch (error) {
      console.error("Failed to start game session:", error);
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || "Failed to start game session";

      if (errorMessage.includes("no start page")) {
        alert("This story is not ready to play yet. The author needs to set up the story pages first.");
      } else if (errorMessage.includes("not published")) {
        alert("This story is not published yet and cannot be played.");
      } else {
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) {
      alert("You must be logged in to rate this story.");
      return;
    }
    if (userScore < 1 || userScore > 5) {
      alert("Please select a rating between 1 and 5.");
      return;
    }

    try {
      setRatingSubmitting(true);
      await ratingService.rateStory(id, userScore, userComment || undefined);
      await loadRatings(id);
    } catch (error: unknown) {
      console.error("Failed to submit rating:", error);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!id) return;
    try {
      setRatingSubmitting(true);
      await ratingService.deleteRating(id);
      setMyRating(null);
      setUserScore(0);
      setUserComment("");
      await loadRatings(id);
    } catch (error) {
      console.error("Failed to delete rating:", error);
      alert("Failed to delete rating. Please try again.");
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!id) return;
    try {
      setReportSubmitting(true);
      await reportService.reportStory(id, reportType, reportDescription || undefined);
      setReportDialogOpen(false);
      setReportDescription("");
      setReportType("inappropriate_content");
      alert("Report submitted. Thank you for your feedback.");
    } catch (error) {
      console.error("Failed to submit report:", error);
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "Failed to submit report.";
      alert(msg);
    } finally {
      setReportSubmitting(false);
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
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-50"
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={`w-4 h-4 ${isFavorited ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                <span>{isFavorited ? "Favorited" : "Favorite"}</span>
              </button>
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

            {/* Ratings & Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Ratings & Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-semibold">
                      {ratingsData?.stats.averageScore
                        ? ratingsData.stats.averageScore.toFixed(1)
                        : "No ratings yet"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ratingsData?.stats.totalRatings || 0} vote(s)
                  </div>
                </div>

                {/* User rating form */}
                <div className="border-t border-border/50 pt-4">
                  {user ? (
                    <form onSubmit={handleSubmitRating} className="space-y-3">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setUserScore(value)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                value <= userScore
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">
                          {userScore > 0 ? `${userScore} / 5` : "Select a rating"}
                        </span>
                      </div>
                      <Textarea
                        placeholder="Leave a comment (optional)..."
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={ratingSubmitting}>
                          {ratingSubmitting ? "Submitting..." : "Submit Rating"}
                        </Button>
                        {myRating && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleDeleteRating}
                            disabled={ratingSubmitting}
                          >
                            Remove Rating
                          </Button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Log in to rate and comment on this story.
                    </p>
                  )}
                </div>

                {/* Recent comments */}
                {ratingsData && ratingsData.ratings.length > 0 && (
                  <div className="border-t border-border/50 pt-4 space-y-3">
                    <div className="text-sm font-medium">Recent Comments</div>
                    {ratingsData.ratings.slice(0, 3).map((rating) => (
                      <div
                        key={rating._id}
                        className="p-3 rounded-lg bg-muted/40 border border-border/50 text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <Star
                                key={value}
                                className={`w-3 h-3 ${
                                  value <= rating.score
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {rating.comment && (
                          <p className="text-sm text-muted-foreground">{rating.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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

            {/* Report story */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => setReportDialogOpen(true)}
            >
              <Flag className="w-4 h-4" />
              Report Story
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

      {/* Report dialog */}
      <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report this story</AlertDialogTitle>
            <AlertDialogDescription>
              Help us moderate the platform by explaining what is wrong with this story.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Reason</label>
              <Select
                value={reportType}
                onValueChange={(value) => setReportType(value as ReportType)}
              >
                <SelectTrigger className="bg-input border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate_content">Inappropriate content</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="copyright">Copyright issue</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Details (optional)</label>
              <Textarea
                placeholder="Describe the problem..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reportSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitReport}
              className="bg-destructive text-destructive-foreground"
              disabled={reportSubmitting}
            >
              {reportSubmitting ? "Submitting..." : "Submit Report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
