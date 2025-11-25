import { useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Library, BookOpen, FileText, TrendingUp, Award, Star } from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: "Stories Written", value: "3", icon: FileText, color: "text-primary" },
    { label: "Endings Unlocked", value: "47", icon: Award, color: "text-secondary" },
    { label: "Total Reads", value: "1,234", icon: TrendingUp, color: "text-yellow-500" },
    { label: "Average Rating", value: "4.8", icon: Star, color: "text-yellow-500" },
  ];

  const shortcuts = [
    {
      title: "Browse Stories",
      description: "Discover new adventures",
      icon: Library,
      gradient: "from-primary to-primary/70",
      onClick: () => navigate("/stories"),
    },
    {
      title: "Continue Reading",
      description: "Pick up where you left off",
      icon: BookOpen,
      gradient: "from-secondary to-secondary/70",
      onClick: () => navigate("/stories"),
    },
    {
      title: "My Stories",
      description: "Manage your creations",
      icon: FileText,
      gradient: "from-purple-500 to-pink-500",
      onClick: () => navigate("/my-stories"),
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="mb-2">Welcome back, John!</h1>
          <p className="text-muted-foreground">
            Ready to continue your adventure or create something new?
          </p>
        </div>

        {/* Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {shortcuts.map((shortcut) => (
            <Card 
              key={shortcut.title}
              className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all group"
              onClick={shortcut.onClick}
            >
              <div className={`h-2 bg-gradient-to-r ${shortcut.gradient}`} />
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br ${shortcut.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <shortcut.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{shortcut.title}</CardTitle>
                <CardDescription>{shortcut.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full group-hover:bg-primary/10">
                  Get Started →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div>
          <h2 className="mb-6">Your Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="mb-6">Continue Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>The Forgotten Realm</CardTitle>
                    <CardDescription>by Sarah Chen</CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">65% complete</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                  <div className="h-full w-[65%] bg-gradient-to-r from-primary to-secondary" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Last read: Chapter 12 - The Dark Cavern
                </p>
                <Button className="w-full">Continue Story</Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Cybernetic Dreams</CardTitle>
                    <CardDescription>by Alex Morgan</CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">23% complete</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                  <div className="h-full w-[23%] bg-gradient-to-r from-primary to-secondary" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Last read: Chapter 5 - The Neural Link
                </p>
                <Button className="w-full">Continue Story</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
