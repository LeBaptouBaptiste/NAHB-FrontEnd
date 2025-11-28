import { useState, useCallback } from 'react';
import api from '../../api/client';

export const useRating = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const rateStory = useCallback(async (storyId: string, score: number, comment?: string) => {
        setLoading(true);
        try {
            const res = await api.post(`/ratings/${storyId}`, { score, comment });
            return res.data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getStoryRatings = useCallback(async (storyId: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/ratings/${storyId}`);
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
        rateStory,
        getStoryRatings
    };
};
