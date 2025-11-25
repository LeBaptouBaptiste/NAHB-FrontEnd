import { Link, useLocation } from "react-router-dom";
import { BookOpen, Home, Library, FileText, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { NavButton } from "./ui/NavigationButton";

export function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
            
            <NavButton to="/admin">
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </NavButton>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center cursor-pointer">
            <span className="text-sm text-white">JD</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
