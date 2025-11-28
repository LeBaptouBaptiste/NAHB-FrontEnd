import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	BookOpen,
	Home,
	Library,
	FileText,
	Shield,
	LogOut,
	Menu,
	X,
} from "lucide-react";
import { Button } from "../atoms/button";
import { NavButton } from "../atoms/NavigationButton";
import { useAuth } from "../../context/AuthContext";

export function Navigation() {
	const navigate = useNavigate();
	const { logout, user } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const handleLogout = () => {
		logout();
		navigate("/login");
		setMobileMenuOpen(false);
	};

	const closeMobileMenu = () => {
		setMobileMenuOpen(false);
	};

	return (
		<nav className="border-b border-white/10 bg-background/60 backdrop-blur-md sticky top-0 z-50 shadow-sm">
			<div className="container mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<Link
						to="/dashboard"
						className="flex items-center gap-2 group"
					>
						<div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/20 transition-all">
							<BookOpen className="w-5 h-5 text-white" />
						</div>
						<span className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
							NAHB
						</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-8">
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

							{user?.role === "admin" && (
								<NavButton to="/admin">
									<Shield className="w-4 h-4 mr-2" />
									Admin
								</NavButton>
							)}
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

					{/* Mobile Menu Button */}
					<button
						className="md:hidden p-2 hover:bg-emerald-500/10 rounded-lg transition-colors"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						{mobileMenuOpen ? (
							<X className="w-6 h-6 text-emerald-400" />
						) : (
							<Menu className="w-6 h-6 text-muted-foreground" />
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				{mobileMenuOpen && (
					<div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4 space-y-2 animate-in slide-in-from-top-2">
						<Link
							to="/dashboard"
							onClick={closeMobileMenu}
							className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition-colors"
						>
							<Home className="w-4 h-4" />
							Home
						</Link>

						<Link
							to="/stories"
							onClick={closeMobileMenu}
							className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition-colors"
						>
							<Library className="w-4 h-4" />
							Stories
						</Link>

						<Link
							to="/my-stories"
							onClick={closeMobileMenu}
							className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition-colors"
						>
							<FileText className="w-4 h-4" />
							My Stories
						</Link>

						{user?.role === "admin" && (
							<Link
								to="/admin"
								onClick={closeMobileMenu}
								className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition-colors"
							>
								<Shield className="w-4 h-4" />
								Admin
							</Link>
						)}

						<div className="border-t border-white/10 pt-2 mt-2">
							{user && (
								<div className="flex items-center gap-2 px-4 py-2">
									<div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-md border border-white/10">
										<span className="text-sm text-white font-bold">
											{user.username.substring(0, 2).toUpperCase()}
										</span>
									</div>
									<span className="text-sm font-medium text-muted-foreground">
										{user.username}
									</span>
								</div>
							)}
							<button
								onClick={handleLogout}
								className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
							>
								<LogOut className="w-4 h-4" />
								Logout
							</button>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
