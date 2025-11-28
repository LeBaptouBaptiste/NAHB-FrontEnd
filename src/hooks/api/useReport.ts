import { useState, useCallback } from "react";
import api from "../../api/client";

export const useReport = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const reportStory = useCallback(
		async (storyId: string, type: string, description: string) => {
			setLoading(true);
			try {
				const res = await api.post(`/reports/${storyId}`, {
					type,
					description,
				});
				return res.data;
			} catch (err: any) {
				setError(err.message);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	return {
		loading,
		error,
		reportStory,
	};
};
