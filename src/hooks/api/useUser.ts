import { useState, useCallback } from 'react';
import api from '../../api/client';

export const useUser = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getUserStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/users/stats');
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
        getUserStats
    };
};
