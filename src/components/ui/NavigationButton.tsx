import { Link, useLocation } from "react-router-dom";
import { Button } from "./button"; // shadcn

interface NavButtonProps {
  to: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function NavButton({ to, icon, children }: NavButtonProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to}>
      <Button
        variant={isActive ? "default" : "ghost"}
        size="sm"
        className={(
          isActive
            ? "text-fuchsia-600"
            : "text-muted-foreground hover:text-foreground hover:cursor-pointer"
        )}
      >
        {icon && <span className="w-4 h-4 mr-2">{icon}</span>}
        {children}
      </Button>
    </Link>
  );
}
