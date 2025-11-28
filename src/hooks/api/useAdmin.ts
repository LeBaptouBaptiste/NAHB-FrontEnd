import { useState, useCallback } from 'react';
import api from '../../api/client';

export const useAdmin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAllUsers = useCallback(async (page: number = 1, limit: number = 20, search?: string) => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users', { params: { page, limit, search } });
            return res.data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleUserBan = useCallback(async (userId: number, banned: boolean) => {
        setLoading(true);
        try {
            const res = await api.post(`/admin/users/${userId}/ban`, { banned });
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
        getAllUsers,
        toggleUserBan
    };
};
