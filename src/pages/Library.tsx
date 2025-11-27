import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

interface Story {
	_id: string;
	title: string;
	description: string;
	tags: string[];
	status: string;
	authorId: string;
	theme?: string;
	stats: {
		views: number;
		completions: number;
	};
}

const Library = () => {
	const [stories, setStories] = useState<Story[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		fetchPublishedStories();
	}, []);

	const fetchPublishedStories = async (search?: string) => {
		try {
			setLoading(true);
			const url = search
				? `/stories/published?search=${encodeURIComponent(search)}`
				: "/stories/published";
			const response = await api.get<Story[]>(url);
			setStories(response.data);
		} catch (error) {
			console.error("Failed to fetch stories:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		fetchPublishedStories(searchTerm);
	};

	const handleStoryClick = async (storyId: string) => {
		try {
			// Create a new game session
			const response = await api.post("/game/start", { storyId });
			const sessionId = response.data._id;

			// Navigate to the game player
			navigate(`/play/${sessionId}`);
		} catch (error) {
			console.error("Failed to start game:", error);
			// Fallback: navigate to editor
			navigate(`/story/${storyId}/edit`);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-gray-400 text-lg">Loading stories...</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto">
			<div className="mb-8">
				<h2 className="text-3xl font-bold mb-4 text-white">Story Library</h2>
				<p className="text-gray-400 mb-6">
					Discover and play interactive stories
				</p>

				{/* Search Bar */}
				<form
					onSubmit={handleSearch}
					className="flex gap-3"
				>
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search stories..."
						className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 focus:outline-none"
					/>
					<button
						type="submit"
						className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
					>
						Search
					</button>
				</form>
			</div>

			{/* Stories Grid */}
			{stories.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-400 text-lg">No published stories found.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{stories.map((story) => (
						<div
							key={story._id}
							onClick={() => handleStoryClick(story._id)}
							className="bg-gray-800 border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-indigo-500 transition-all hover:shadow-lg hover:shadow-indigo-500/20"
						>
							<h3 className="text-xl font-bold text-white mb-2">
								{story.title}
							</h3>
							<p className="text-gray-400 text-sm mb-4 line-clamp-3">
								{story.description || "No description available."}
							</p>

							{/* Tags */}
							{story.tags && story.tags.length > 0 && (
								<div className="flex flex-wrap gap-2 mb-4">
									{story.tags.slice(0, 3).map((tag, index) => (
										<span
											key={index}
											className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
										>
											{tag}
										</span>
									))}
									{story.tags.length > 3 && (
										<span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
											+{story.tags.length - 3}
										</span>
									)}
								</div>
							)}

							{/* Stats */}
							<div className="flex gap-4 text-sm text-gray-500">
								<div className="flex items-center gap-1">
									<span>👁️</span>
									<span>{story.stats.views || 0}</span>
								</div>
								<div className="flex items-center gap-1">
									<span>✅</span>
									<span>{story.stats.completions || 0}</span>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Library;
