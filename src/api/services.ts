import api from './client';

export interface Story {
    _id: string;
    title: string;
    description: string;
    imageUrl?: string;
    authorId: string;
    startPageId?: string;
    status: 'draft' | 'published';
    theme: string;
    tags: string[];
    stats: {
        views: number;
        completions: number;
        endings: Record<string, number>;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Page {
    _id: string;
    storyId: string;
    content: string;
    image?: string;
    choices: {
        text: string;
        targetPageId: string;
    }[];
    isEnding: boolean;
    endingType?: 'success' | 'failure' | 'neutral';
}

export const storyService = {
    getPublishedStories: async (search?: string) => {
        const params = search ? { search } : {};
        const response = await api.get<Story[]>('/stories/published', { params });
        return response.data;
    },
    getStory: async (id: string) => {
        const response = await api.get<Story>(`/stories/${id}`);
        return response.data;
    },
    createStory: async (data: Partial<Story>) => {
        const response = await api.post<Story>('/stories', data);
        return response.data;
    },
    getMyStories: async () => {
        const response = await api.get<Story[]>('/stories/my');
        return response.data;
    },
    updateStory: async (id: string, data: Partial<Story>) => {
        const response = await api.put<Story>(`/stories/${id}`, data);
        return response.data;
    },
    deleteStory: async (id: string) => {
        const response = await api.delete(`/stories/${id}`);
        return response.data;
    },
    getPages: async (storyId: string) => {
        const response = await api.get<Page[]>(`/pages/story/${storyId}`);
        return response.data;
    },
};

export const pageService = {
    createPage: async (storyId: string, data: Partial<Page>) => {
        const response = await api.post<Page>('/pages', { ...data, storyId });
        return response.data;
    },
    updatePage: async (id: string, data: Partial<Page>) => {
        const response = await api.put<Page>(`/pages/${id}`, data);
        return response.data;
    },
    deletePage: async (id: string) => {
        const response = await api.delete(`/pages/${id}`);
        return response.data;
    },
    getPage: async (id: string) => {
        const response = await api.get<Page>(`/pages/${id}`);
        return response.data;
    },
};

export interface GameSession {
    _id: string;
    userId: string;
    storyId: string;
    currentPageId: string;
    history: string[];
    status: 'in_progress' | 'completed' | 'abandoned';
    isPreview: boolean;
}

export const gameService = {
    startSession: async (storyId: string, preview: boolean = false) => {
        const response = await api.post<GameSession>('/game/start', { storyId, preview });
        return response.data;
    },
    getSession: async (sessionId: string) => {
        const response = await api.get<GameSession>(`/game/session/${sessionId}`);
        return response.data;
    },
    makeChoice: async (sessionId: string, choiceIndex: number) => {
        const response = await api.post<GameSession>('/game/choice', { sessionId, choiceIndex });
        return response.data;
    },
    getUserSessions: async () => {
        const response = await api.get<GameSession[]>('/game/sessions');
        return response.data;
    }
};

export interface AIStoryRequest {
    userPrompt: string;
    theme?: string;
    numPages?: number;
    language?: string;
}

export const aiService = {
    generateStory: async (data: AIStoryRequest) => {
        // This might take a while, so we might want to handle timeouts or async processing
        const response = await api.post<{ data: { storyId: string } }>('/ai/generate-story', data, {
            timeout: 180000 // 3 minutes timeout for full generation
        });
        return response.data.data;
    },
    suggestChoices: async (pageContent: string, storyContext: string) => {
        const response = await api.post<any[]>('/ai/suggest-choices', { pageContent, storyContext });
        return response.data;
    },
    healthCheck: async () => {
        try {
            const response = await api.get('/ai/health');
            return response.data.success;
        } catch (e) {
            return false;
        }
    }
};

export const uploadService = {
    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post<{ url: string }>('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export const favoriteService = {
    toggleFavorite: async (storyId: string) => {
        const response = await api.post<{ favorited: boolean }>(`/favorites/story/${storyId}`);
        return response.data;
    },
    checkFavorite: async (storyId: string) => {
        const response = await api.get<{ favorited: boolean }>(`/favorites/story/${storyId}`);
        return response.data;
    },
    getFavorites: async () => {
        const response = await api.get<Story[]>('/favorites/me');
        return response.data;
    },
};

export const userService = {
    getStats: async () => {
        const response = await api.get<{
            storiesWritten: number;
            endingsUnlocked: number;
            totalReads: number;
            averageRating: number;
        }>('/user/stats');
        return response.data;
    },
};

export const adminService = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
    getAllStories: async (params?: { status?: string; page?: number; limit?: number; search?: string }) => {
        const response = await api.get('/admin/stories', { params });
        return response.data;
    },
    getAllUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },
    getAllReports: async (params?: { status?: string; page?: number; limit?: number }) => {
        const response = await api.get('/admin/reports', { params });
        return response.data;
    },
    toggleUserBan: async (userId: string, banned: boolean) => {
        const response = await api.patch(`/admin/users/${userId}/ban`, { banned });
        return response.data;
    },
    toggleStorySuspension: async (storyId: string, suspended: boolean) => {
        const response = await api.patch(`/admin/stories/${storyId}/suspend`, { suspended });
        return response.data;
    },
    updateReportStatus: async (reportId: string, status: string, adminNotes?: string) => {
        const response = await api.patch(`/admin/reports/${reportId}`, { status, adminNotes });
        return response.data;
    },
};
