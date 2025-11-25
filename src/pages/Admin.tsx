import { useState } from "react";
import { Navigation } from "../components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
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
import { 
  BookOpen, 
  Users, 
  Flag, 
  TrendingUp, 
  MoreVertical,
  Ban,
  Check,
  Eye,
  Trash2,
  Search
} from "lucide-react";

export function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"ban" | "delete" | "approve" | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const stats = [
    { label: "Total Stories", value: "1,234", icon: BookOpen, change: "+12%", color: "text-primary" },
    { label: "Total Users", value: "5,678", icon: Users, change: "+8%", color: "text-secondary" },
    { label: "Total Plays", value: "89.2K", icon: TrendingUp, change: "+23%", color: "text-green-500" },
    { label: "Pending Reports", value: "12", icon: Flag, change: "-5%", color: "text-yellow-500" },
  ];

  const stories = [
    { id: "1", title: "The Forgotten Realm", author: "Sarah Chen", status: "published", plays: 12453, rating: 4.8, reports: 0 },
    { id: "2", title: "Cybernetic Dreams", author: "Alex Morgan", status: "published", plays: 9876, rating: 4.6, reports: 2 },
    { id: "3", title: "Dark Secrets", author: "John Doe", status: "pending", plays: 0, rating: 0, reports: 5 },
  ];

  const reports = [
    { id: "1", type: "Inappropriate Content", story: "Dark Secrets", reporter: "User123", date: "2 hours ago", status: "pending" },
    { id: "2", type: "Spam", story: "Cybernetic Dreams", reporter: "Reader456", date: "5 hours ago", status: "pending" },
    { id: "3", type: "Copyright", story: "The Forgotten Realm", reporter: "Author789", date: "1 day ago", status: "resolved" },
  ];

  const users = [
    { id: "1", username: "Sarah Chen", email: "sarah@example.com", stories: 12, joined: "Jan 2024", status: "active" },
    { id: "2", username: "Alex Morgan", email: "alex@example.com", stories: 8, joined: "Feb 2024", status: "active" },
    { id: "3", username: "John Doe", email: "john@example.com", stories: 1, joined: "Mar 2024", status: "banned" },
  ];

  const handleAction = (type: "ban" | "delete" | "approve", itemId: string) => {
    setActionType(type);
    setSelectedItem(itemId);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    console.log(`Action ${actionType} on item ${selectedItem}`);
    setActionDialogOpen(false);
    setActionType(null);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage stories, users, and reports
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold mb-1">{stat.value}</div>
                <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stories" className="space-y-6">
          <TabsList className="bg-card border border-border/50">
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* Stories Tab */}
          <TabsContent value="stories" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Story Moderation</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-input border-border/50"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plays</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stories.map((story) => (
                      <TableRow key={story.id}>
                        <TableCell>{story.title}</TableCell>
                        <TableCell>{story.author}</TableCell>
                        <TableCell>
                          <Badge variant={story.status === "published" ? "default" : "secondary"}>
                            {story.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{story.plays.toLocaleString()}</TableCell>
                        <TableCell>{story.rating > 0 ? story.rating.toFixed(1) : '-'}</TableCell>
                        <TableCell>
                          {story.reports > 0 ? (
                            <Badge variant="destructive">{story.reports}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Story
                              </DropdownMenuItem>
                              {story.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleAction("approve", story.id)}>
                                  <Check className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleAction("delete", story.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Story</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Badge variant="outline">{report.type}</Badge>
                        </TableCell>
                        <TableCell>{report.story}</TableCell>
                        <TableCell>{report.reporter}</TableCell>
                        <TableCell className="text-muted-foreground">{report.date}</TableCell>
                        <TableCell>
                          <Badge variant={report.status === "pending" ? "secondary" : "default"}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              Review
                            </Button>
                            {report.status === "pending" && (
                              <Button size="sm">
                                Resolve
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10 bg-input border-border/50"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Stories</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>{user.stories}</TableCell>
                        <TableCell className="text-muted-foreground">{user.joined}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              {user.status === "active" ? (
                                <DropdownMenuItem 
                                  onClick={() => handleAction("ban", user.id)}
                                  className="text-destructive"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Ban User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>
                                  <Check className="w-4 h-4 mr-2" />
                                  Unban User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Stories Published</span>
                        <span>1,234</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-gradient-to-r from-primary to-secondary" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Active Users</span>
                        <span>4,892</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-[72%] bg-gradient-to-r from-primary to-secondary" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Daily Plays</span>
                        <span>15,234</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-[93%] bg-gradient-to-r from-primary to-secondary" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Genres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { genre: "Fantasy", count: 456, percentage: 37 },
                      { genre: "Sci-Fi", count: 342, percentage: 28 },
                      { genre: "Mystery", count: 234, percentage: 19 },
                      { genre: "Horror", count: 123, percentage: 10 },
                      { genre: "Romance", count: 79, percentage: 6 },
                    ].map((item) => (
                      <div key={item.genre} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm w-20">{item.genre}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-secondary"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground w-16 text-right">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "ban" && "Are you sure you want to ban this user?"}
              {actionType === "delete" && "Are you sure you want to delete this item? This action cannot be undone."}
              {actionType === "approve" && "Are you sure you want to approve this story for publication?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction}
              className={actionType === "delete" || actionType === "ban" ? "bg-destructive text-destructive-foreground" : ""}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
