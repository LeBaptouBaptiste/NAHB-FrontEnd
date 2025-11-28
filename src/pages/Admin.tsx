import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../components/templates/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/atoms/card";
import { Button } from "../components/atoms/button";
import { Input } from "../components/atoms/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/atoms/tabs";
import { Badge } from "../components/atoms/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/atoms/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/atoms/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/atoms/alert-dialog";
import {
  BookOpen,
  Users,
  Flag,
  TrendingUp,
  MoreVertical,
  Ban,
  Check,
  Eye,
  Search,
  Loader2
} from "lucide-react";
import { adminService } from "../api/services";
import type { Story } from "../api/services";
import { useAuth } from "../context/AuthContext";

interface AdminStats {
  users: { total: number };
  stories: { total: number; totalViews: number };
  sessions: { total: number };
  reports: { total: number; pending: number };
}

interface AdminStory extends Story {
  authorId: string;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AdminReport {
  _id: string;
  storyId: string;
  reporterId: string;
  type: string;
  description?: string;
  status: string;
  createdAt: string;
}

export function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"ban" | "delete" | "approve" | "suspend" | "resolve" | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [stories, setStories] = useState<AdminStory[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [activeTab, setActiveTab] = useState("stories");

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === "stories" && searchQuery) {
      loadStories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeTab]);

  useEffect(() => {
    if (activeTab === "users" && userSearchQuery) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearchQuery, activeTab]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      console.log('[Admin] Loading admin data...');

      const [statsData, storiesData, usersData, reportsData] = await Promise.all([
        adminService.getStats(),
        adminService.getAllStories({ limit: 50 }),
        adminService.getAllUsers({ limit: 50 }),
        adminService.getAllReports({ limit: 50 }),
      ]);

      console.log('[Admin] Stats data:', statsData);
      console.log('[Admin] Stories data:', storiesData);
      console.log('[Admin] Stories array:', storiesData.stories);
      console.log('[Admin] Stories count:', storiesData.stories?.length || 0);
      console.log('[Admin] Users data:', usersData);
      console.log('[Admin] Reports data:', reportsData);

      setStats(statsData);
      setStories(storiesData.stories || []);
      setUsers(usersData.users || []);
      setReports(reportsData.reports || []);
    } catch (error: unknown) {
      console.error("[Admin] Failed to load admin data:", error);
      console.error("[Admin] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response: (error as any)?.response?.data,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: (error as any)?.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async () => {
    try {
      const data = await adminService.getAllStories({ search: searchQuery, limit: 50 });
      setStories(data.stories || []);
    } catch (error) {
      console.error("Failed to load stories:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminService.getAllUsers({ search: userSearchQuery, limit: 50 });
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const handleAction = (type: "ban" | "delete" | "approve" | "suspend" | "resolve", itemId: string) => {
    setActionType(type);
    setSelectedItem(itemId);
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedItem || !actionType) return;

    try {
      if (actionType === "ban") {
        await adminService.toggleUserBan(selectedItem, true);
      } else if (actionType === "suspend") {
        await adminService.toggleStorySuspension(selectedItem, true);
      } else if (actionType === "resolve") {
        await adminService.updateReportStatus(selectedItem, "resolved");
      }
      // Reload data after action
      await loadAdminData();
      setActionDialogOpen(false);
      setActionType(null);
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to perform action:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  const statsDisplay = stats ? [
    { label: "Total Stories", value: stats.stories.total.toString(), icon: BookOpen, change: "", color: "text-primary" },
    { label: "Total Users", value: stats.users.total.toString(), icon: Users, change: "", color: "text-secondary" },
    { label: "Total Plays", value: stats.stories.totalViews.toLocaleString(), icon: TrendingUp, change: "", color: "text-green-500" },
    { label: "Pending Reports", value: stats.reports.pending.toString(), icon: Flag, change: "", color: "text-yellow-500" },
  ] : [];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage stories, users, and reports
          </p>
        </div>

        {/* Stats Overview */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsDisplay.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold mb-1">{stat.value}</div>
                  {stat.change && (
                    <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change} from last month
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="stories" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Plays</TableHead>
                        <TableHead>Completions</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No stories found
                          </TableCell>
                        </TableRow>
                      ) : (
                        stories.map((story) => (
                          <TableRow key={story._id}>
                            <TableCell className="font-medium">{story.title}</TableCell>
                            <TableCell className="text-muted-foreground">{story.authorId.substring(0, 8)}...</TableCell>
                            <TableCell>
                              <Badge variant={story.status === "published" ? "default" : story.status === "draft" ? "secondary" : "destructive"}>
                                {story.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{story.stats?.views || 0}</TableCell>
                            <TableCell>{story.stats?.completions || 0}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/story/${story._id}`)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Story
                                  </DropdownMenuItem>
                                  {story.status === "published" && (
                                    <DropdownMenuItem onClick={() => handleAction("suspend", story._id)}>
                                      <Ban className="w-4 h-4 mr-2" />
                                      Suspend
                                    </DropdownMenuItem>
                                  )}
                                  {story.status === "draft" && (
                                    <DropdownMenuItem onClick={() => adminService.toggleStorySuspension(story._id, false).then(() => loadAdminData())}>
                                      <Check className="w-4 h-4 mr-2" />
                                      Unsuspend
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
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
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reason</TableHead>
                        <TableHead>Story ID</TableHead>
                        <TableHead>Reporter ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No reports found
                          </TableCell>
                        </TableRow>
                      ) : (
                        reports.map((report) => (
                          <TableRow key={report._id}>
                            <TableCell>
                              <Badge variant="outline">{report.type}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{report.storyId.substring(0, 8)}...</TableCell>
                            <TableCell className="text-muted-foreground">{report.reporterId.substring(0, 8)}...</TableCell>
                            <TableCell className="text-muted-foreground">{formatRelativeDate(report.createdAt)}</TableCell>
                            <TableCell>
                              <Badge variant={report.status === "pending" ? "secondary" : "default"}>
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {report.status === "pending" && (
                                  <Button size="sm" onClick={() => handleAction("resolve", report._id)}>
                                    Resolve
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
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
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="pl-10 bg-input border-border/50"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === "admin" ? "default" : user.role === "banned" ? "destructive" : "secondary"}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {user.role !== "admin" && user.role !== "banned" && (
                                    <DropdownMenuItem
                                      onClick={() => handleAction("ban", user.id.toString())}
                                      className="text-destructive"
                                    >
                                      <Ban className="w-4 h-4 mr-2" />
                                      Ban User
                                    </DropdownMenuItem>
                                  )}
                                  {user.role === "banned" && (
                                    <DropdownMenuItem onClick={() => adminService.toggleUserBan(user.id.toString(), false).then(() => loadAdminData())}>
                                      <Check className="w-4 h-4 mr-2" />
                                      Unban User
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Total Stories</span>
                          <span>{stats.stories.total}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-full bg-gradient-to-r from-primary to-secondary" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Total Users</span>
                          <span>{stats.users.total}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-full bg-gradient-to-r from-primary to-secondary" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Total Plays</span>
                          <span>{stats.stories.totalViews.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-full bg-gradient-to-r from-primary to-secondary" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reports Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pending Reports</span>
                        <span className="text-sm font-semibold">{stats.reports.pending}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Reports</span>
                        <span className="text-sm font-semibold">{stats.reports.total}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "ban" && "Are you sure you want to ban this user?"}
              {actionType === "suspend" && "Are you sure you want to suspend this story?"}
              {actionType === "resolve" && "Are you sure you want to resolve this report?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={actionType === "ban" || actionType === "suspend" ? "bg-destructive text-destructive-foreground" : ""}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
