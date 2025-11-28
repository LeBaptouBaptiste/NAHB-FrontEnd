import { useState, useCallback } from "react";
import api from "../../api/client";

export const useAI = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const generateStory = useCallback(async (prompt: string) => {
		setLoading(true);
		try {
			const res = await api.post("/ai/generate-story", { prompt });
			return res.data;
		} catch (err: any) {
			setError(err.message);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		loading,
		error,
		generateStory,
	};
};
