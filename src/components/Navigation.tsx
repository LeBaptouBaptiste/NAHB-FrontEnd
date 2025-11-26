import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Home, Library, FileText, Shield, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { NavButton } from "./ui/NavigationButton";
import { useAuth } from "../context/AuthContext";

export function Navigation() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-white/10 bg-background/60 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/20 transition-all">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              NAHB
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <NavButton to="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Home
            </NavButton>

            <NavButton to="/stories">
              <Library className="w-4 h-4 mr-2" />
              Stories
            </NavButton>

            <NavButton to="/my-stories">
              <FileText className="w-4 h-4 mr-2" />
              My Stories
            </NavButton>

            {user?.role === 'admin' && (
              <NavButton to="/admin">
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </NavButton>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center cursor-pointer shadow-md border border-white/10">
                <span className="text-sm text-white font-bold">
                  {user.username.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium hidden sm:inline text-muted-foreground">
                {user.username}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
