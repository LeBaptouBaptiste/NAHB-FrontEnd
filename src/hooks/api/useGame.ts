import { useState, useCallback } from 'react';
import api from '../../api/client';

export const useGame = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startGame = useCallback(async (storyId: string) => {
        setLoading(true);
        try {
            const res = await api.post('/games/start', { storyId });
            return res.data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const makeChoice = useCallback(async (sessionId: string, choiceId: string) => {
        setLoading(true);
        try {
            const res = await api.post(`/games/${sessionId}/choice`, { choiceId });
            return res.data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getSession = useCallback(async (sessionId: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/games/${sessionId}`);
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
        startGame,
        makeChoice,
        getSession
    };
};
