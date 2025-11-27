import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
	Library,
	BookOpen,
	FileText,
	TrendingUp,
	Award,
	Star,
	Loader2,
} from "lucide-react";
import { userService, gameService, storyService } from "../api/services";
import type { GameSession, Story } from "../api/services";

export function Dashboard() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		storiesWritten: 0,
		endingsUnlocked: 0,
		totalReads: 0,
		averageRating: 0,
	});
	const [continueReading, setContinueReading] = useState<
		Array<{
			session: GameSession;
			story: Story;
			progress: number;
		}>
	>([]);

	useEffect(() => {
		loadDashboardData();
	}, []);

	const loadDashboardData = async () => {
		try {
			setLoading(true);
			const [statsData, sessionsData] = await Promise.all([
				userService.getStats(),
				gameService.getUserSessions(),
			]);

			setStats(statsData);

			// Filter in-progress sessions and fetch story details
			const inProgressSessions = sessionsData.filter(
				(s) => s.status === "in_progress" && !s.isPreview
			);
			const sessionsWithStories = await Promise.all(
				inProgressSessions.slice(0, 2).map(async (session) => {
					const story = await storyService.getStory(session.storyId);
					// Calculate progress (simplified: based on history length)
					// In a real scenario, you'd calculate based on total pages vs visited
					const progress = Math.min((session.history.length / 10) * 100, 100);
					return { session, story, progress };
				})
			);
			setContinueReading(sessionsWithStories);
		} catch (error) {
			console.error("Failed to load dashboard data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleContinueStory = (sessionId: string) => {
		navigate(`/play/${sessionId}`);
	};

	const statsDisplay = [
		{
			label: "Stories Written",
			value: stats.storiesWritten.toString(),
			icon: FileText,
			color: "text-primary",
		},
		{
			label: "Endings Unlocked",
			value: stats.endingsUnlocked.toString(),
			icon: Award,
			color: "text-secondary",
		},
		{
			label: "Total Reads",
			value: stats.totalReads.toLocaleString(),
			icon: TrendingUp,
			color: "text-yellow-500",
		},
		{
			label: "Average Rating",
			value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A",
			icon: Star,
			color: "text-yellow-500",
		},
	];

	const shortcuts = [
		{
			title: "Browse Stories",
			description: "Discover new adventures",
			icon: Library,
			gradient: "from-emerald-500 to-green-500",
			onClick: () => navigate("/stories"),
		},
		{
			title: "Continue Reading",
			description: "Pick up where you left off",
			icon: BookOpen,
			gradient: "from-cyan-500 to-blue-500",
			onClick: () => navigate("/stories"),
		},
		{
			title: "My Stories",
			description: "Manage your creations",
			icon: FileText,
			gradient: "from-emerald-600 to-teal-600",
			onClick: () => navigate("/my-stories"),
		},
	];

	return (
		<div className="min-h-screen">
			<Navigation />

			<main className="container mx-auto px-6 py-12">
				{/* Welcome Section */}
				<div className="mb-12">
					<div className="flex items-center gap-3 mb-2">
						<div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
							<TrendingUp className="w-8 h-8 text-emerald-500" />
						</div>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
							Welcome back!
						</h1>
					</div>
					<p className="text-muted-foreground text-lg ml-1">
						Ready to continue your adventure or create something new?
					</p>
				</div>

				{/* Shortcuts */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					{shortcuts.map((shortcut) => (
						<Card
							key={shortcut.title}
							className="overflow-hidden cursor-pointer bg-card/50 backdrop-blur-sm border-white/10 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 group"
							onClick={shortcut.onClick}
						>
							<div className={`h-2 bg-gradient-to-r ${shortcut.gradient}`} />
							<CardHeader className="pb-4">
								<div
									className={`w-14 h-14 rounded-xl bg-gradient-to-br ${shortcut.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
								>
									<shortcut.icon className="w-7 h-7 text-white" />
								</div>
								<CardTitle className="text-xl">{shortcut.title}</CardTitle>
								<CardDescription>{shortcut.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									variant="ghost"
									className="w-full group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors"
								>
									Get Started →
								</Button>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Stats */}
				<div>
					<h2 className="mb-6">Your Stats</h2>
					{loading ? (
						<div className="flex justify-center py-12">
							<Loader2 className="w-8 h-8 animate-spin text-primary" />
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{statsDisplay.map((stat) => (
								<Card
									key={stat.label}
									className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-emerald-500/30 transition-all shadow-sm"
								>
									<CardHeader className="flex flex-row items-center justify-between pb-2">
										<CardTitle className="text-sm text-muted-foreground">
											{stat.label}
										</CardTitle>
										<stat.icon className={`w-5 h-5 ${stat.color}`} />
									</CardHeader>
									<CardContent>
										<div className="text-3xl font-bold text-emerald-500">
											{stat.value}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>

				{/* Recent Activity */}
				<div className="mt-12">
					<h2 className="mb-6">Continue Reading</h2>
					{loading ? (
						<div className="flex justify-center py-12">
							<Loader2 className="w-8 h-8 animate-spin text-primary" />
						</div>
					) : continueReading.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{continueReading.map(({ session, story, progress }) => (
								<Card
									key={session._id}
									className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300"
								>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div>
												<CardTitle>{story.title}</CardTitle>
												<CardDescription>
													Author ID: {story.authorId.substring(0, 8)}...
												</CardDescription>
											</div>
											<div className="text-sm font-medium text-emerald-500">
												{Math.round(progress)}% complete
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="w-full h-2.5 bg-muted/50 rounded-full overflow-hidden mb-4">
											<div
												className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
												style={{ width: `${progress}%` }}
											/>
										</div>
										<p className="text-sm text-muted-foreground mb-4">
											Last read: {session.history.length} pages visited
										</p>
										<Button
											className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all"
											onClick={() => handleContinueStory(session._id)}
										>
											Continue Story
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<Card>
							<CardContent className="py-12 text-center">
								<p className="text-muted-foreground">
									No stories in progress. Start reading a story to continue
									here!
								</p>
								<Button
									className="mt-4"
									onClick={() => navigate("/stories")}
								>
									Browse Stories
								</Button>
							</CardContent>
						</Card>
					)}
				</div>
			</main>
		</div>
	);
}
