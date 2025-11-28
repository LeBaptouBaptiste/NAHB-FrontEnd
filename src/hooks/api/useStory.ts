import { useState, useCallback } from 'react';
import api from '../../api/client';

export const useStory = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getMyStories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/stories/my-stories');
            return res.data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getStory = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/stories/${id}`);
            return res.data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createStory = useCallback(async (data: any) => {
        setLoading(true);
        try {
            const res = await api.post('/stories', data);
            return res.data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStory = useCallback(async (id: string, data: any) => {
        setLoading(true);
        try {
            const res = await api.put(`/stories/${id}`, data);
            return res.data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteStory = useCallback(async (id: string) => {
        setLoading(true);
        try {
            await api.delete(`/stories/${id}`);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const publishStory = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const res = await api.post(`/stories/${id}/publish`);
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
        getMyStories,
        getStory,
        createStory,
        updateStory,
        deleteStory,
        publishStory
    };
};
