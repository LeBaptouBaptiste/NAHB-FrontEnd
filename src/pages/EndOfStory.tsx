import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Trophy, RotateCcw, List, TrendingUp } from "lucide-react";
import { Badge } from "../components/ui/badge";

export function EndOfStory() {
	const navigate = useNavigate();
	const { id } = useParams();
	const location = useLocation();
	const { ending, path } = location.state || {
		ending: "Unknown Ending",
		path: [],
	};

	const endingStats = {
		"Heroic Victory": {
			percentage: 32,
			color: "from-yellow-500 to-yellow-600",
		},
		"Dark Alliance": { percentage: 18, color: "from-purple-500 to-purple-600" },
		"Peaceful Resolution": {
			percentage: 25,
			color: "from-blue-500 to-blue-600",
		},
		"True Mage": { percentage: 8, color: "from-indigo-500 to-indigo-600" },
		"Dragon Rider": { percentage: 12, color: "from-red-500 to-red-600" },
		"Pyrrhic Victory": { percentage: 5, color: "from-gray-500 to-gray-600" },
	};

	const currentEndingStats = endingStats[
		ending as keyof typeof endingStats
	] || { percentage: 0, color: "from-primary to-secondary" };

	const pathSteps = [
		{ step: 1, description: "Entered the Forgotten Realm" },
		{ step: 2, description: "Chose your path" },
		{ step: 3, description: "Made a crucial decision" },
		{ step: 4, description: `Reached: ${ending}` },
	];

	return (
		<div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

			<div className="w-full max-w-4xl relative z-10 space-y-6">
				{/* Ending Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-6">
						<Trophy className="w-10 h-10 text-white" />
					</div>
					<h1 className="mb-4">Story Complete!</h1>
					<Badge
						className={`bg-gradient-to-r ${currentEndingStats.color} text-white border-0 px-6 py-2 text-lg`}
					>
						{ending}
					</Badge>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Stats Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrendingUp className="w-5 h-5" />
								Ending Statistics
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-muted-foreground">
										Players who reached this ending
									</span>
									<span className="text-2xl font-semibold">
										{currentEndingStats.percentage}%
									</span>
								</div>
								<div className="w-full h-3 bg-muted rounded-full overflow-hidden">
									<div
										className={`h-full bg-gradient-to-r ${currentEndingStats.color} transition-all duration-1000`}
										style={{ width: `${currentEndingStats.percentage}%` }}
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="p-4 bg-muted/50 rounded-lg text-center">
									<div className="text-2xl font-semibold">{path.length}</div>
									<div className="text-sm text-muted-foreground">
										Choices Made
									</div>
								</div>
								<div className="p-4 bg-muted/50 rounded-lg text-center">
									<div className="text-2xl font-semibold">12:34</div>
									<div className="text-sm text-muted-foreground">
										Time Spent
									</div>
								</div>
							</div>

							<div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/30">
								<div className="text-sm text-muted-foreground mb-1">
									Achievement Unlocked
								</div>
								<div className="flex items-center gap-2">
									<Trophy className="w-4 h-4 text-primary" />
									<span>First Time Completing "{ending}"</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Path Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<List className="w-5 h-5" />
								Your Journey
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{pathSteps.map((item, index) => (
									<div
										key={index}
										className="flex gap-4"
									>
										<div className="flex flex-col items-center">
											<div
												className={`w-8 h-8 rounded-full flex items-center justify-center ${
													index === pathSteps.length - 1
														? `bg-gradient-to-br ${currentEndingStats.color}`
														: "bg-muted"
												}`}
											>
												<span className="text-sm">{item.step}</span>
											</div>
											{index < pathSteps.length - 1 && (
												<div className="w-px h-12 bg-border mt-2" />
											)}
										</div>
										<div className="flex-1 pt-1">
											<p
												className={
													index === pathSteps.length - 1
														? "font-semibold"
														: "text-muted-foreground"
												}
											>
												{item.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Actions */}
				<Card>
					<CardContent className="p-6">
						<div className="flex flex-col sm:flex-row gap-4">
							<Button
								variant="outline"
								className="flex-1 gap-2"
								onClick={() => navigate(`/read/${id}`)}
							>
								<RotateCcw className="w-4 h-4" />
								Replay Story
							</Button>
							<Button
								className="flex-1"
								onClick={() => navigate("/stories")}
							>
								Browse More Stories
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Share Section */}
				<div className="text-center">
					<p className="text-sm text-muted-foreground mb-4">
						Share your achievement with friends!
					</p>
					<div className="flex justify-center gap-2">
						<Button
							variant="outline"
							size="sm"
						>
							Share on Twitter
						</Button>
						<Button
							variant="outline"
							size="sm"
						>
							Copy Link
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
