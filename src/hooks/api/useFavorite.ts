import { useState, useCallback } from 'react';
import api from '../../api/client';

export const useFavorite = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleFavorite = useCallback(async (storyId: string) => {
        setLoading(true);
        try {
            const res = await api.post(`/favorites/${storyId}`);
            return res.data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const checkFavorite = useCallback(async (storyId: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/favorites/${storyId}/check`);
            return res.data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getFavorites = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/favorites');
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
        toggleFavorite,
        checkFavorite,
        getFavorites
    };
};
