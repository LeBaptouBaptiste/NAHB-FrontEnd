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
        diceRoll?: {
            enabled: boolean;
            difficulty?: number; // DC (Difficulty Class)
            type?: 'combat' | 'stealth' | 'persuasion' | 'custom';
        };
    }[];
    isEnding: boolean;
    endingType?: 'success' | 'failure' | 'neutral';
    hotspots?: {
        x: number;
        y: number;
        width: number;
        height: number;
        targetPageId: string;
        label?: string;
        diceRoll?: {
            enabled: boolean;
            difficulty?: number;
            type?: 'combat' | 'stealth' | 'persuasion' | 'custom';
            failurePageId?: string;
        };
    }[];
}

export const storyService = {
    getPublishedStories: async (search?: string) => {
        const params = search ? { search } : {};
        const response = await api.get<Story[]>('/stories/published', { params });
        return response.data;
    },
    getTags: async () => {
        const response = await api.get<string[]>('/stories/tags');
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
    },
    getPathStats: async (sessionId: string) => {
        const response = await api.get<PathStats>(`/game/session/${sessionId}/path-stats`);
        return response.data;
    },
    getStoryStats: async (storyId: string) => {
        const response = await api.get<StoryStats>(`/game/story/${storyId}/stats`);
        return response.data;
    }
};

export interface PathStats {
    sessionId: string;
    storyId: string;
    pathLength: number;
    samePathStats: {
        count: number;
        percentage: number;
        message: string;
    };
    totalCompletedSessions: number;
    endingDistribution: Record<string, { count: number; percentage: number }>;
    currentEnding: {
        type: string;
        reachedByPercentage: number;
    } | null;
}

export interface StoryStats {
    storyId: string;
    views: number;
    totalSessions: number;
    completedSessions: number;
    abandonedSessions: number;
    inProgressSessions: number;
    completionRate: number;
    averagePathLength: number;
    endingDistribution: Record<string, number>;
}

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

export interface Rating {
    _id: string;
    storyId: string;
    userId: string;
    value: number;
    comment?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RatingsResponse {
    ratings: Rating[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    stats: {
        averageScore: number;
        totalRatings: number;
    };
}

export const ratingService = {
    getStoryRatings: async (storyId: string, page = 1, limit = 10) => {
        const response = await api.get<RatingsResponse>(`/ratings/story/${storyId}`, {
            params: { page, limit }
        });
        return response.data;
    },
    getMyRating: async (storyId: string) => {
        const response = await api.get<Rating | null>(`/ratings/story/${storyId}/me`);
        return response.data;
    },
    rateStory: async (storyId: string, score: number, comment?: string) => {
        const response = await api.post<Rating>(`/ratings/story/${storyId}`, { score, comment });
        return response.data;
    },
    deleteRating: async (storyId: string) => {
        const response = await api.delete<{ message: string }>(`/ratings/story/${storyId}`);
        return response.data;
    },
};

export type ReportType =
    | 'inappropriate_content'
    | 'spam'
    | 'copyright'
    | 'harassment'
    | 'other';

export interface Report {
    _id: string;
    storyId: string;
    reporterId: string;
    type: ReportType;
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    adminNotes?: string;
    resolvedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export const reportService = {
    reportStory: async (storyId: string, type: ReportType, description?: string) => {
        const response = await api.post<{ message: string; report: Report }>(
            `/reports/story/${storyId}`,
            { type, description }
        );
        return response.data;
    },
    getMyReports: async () => {
        const response = await api.get<Report[]>('/reports/my-reports');
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
