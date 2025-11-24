import api from './client';

export interface Story {
    _id: string;
    title: string;
    description: string;
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
    getStory: async (id: string) => {
        const response = await api.get<Story>(`/stories/${id}`);
        return response.data;
    },
    updateStory: async (id: string, data: Partial<Story>) => {
        const response = await api.put<Story>(`/stories/${id}`, data);
        return response.data;
    },
    getPages: async (storyId: string) => {
        const response = await api.get<Page[]>(`/stories/${storyId}/pages`);
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
