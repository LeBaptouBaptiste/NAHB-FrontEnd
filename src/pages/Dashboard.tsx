import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface Story {
    _id: string;
    title: string;
    description: string;
    status: 'draft' | 'published' | 'suspended';
    tags: string[];
    stats: {
        views: number;
        completions: number;
        endings: Record<string, number>;
    };
    createdAt: string;
    updatedAt: string;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newStoryData, setNewStoryData] = useState({
        title: '',
        description: '',
        tags: '',
    });

    useEffect(() => {
        fetchMyStories();
    }, []);

    const fetchMyStories = async () => {
        try {
            setLoading(true);
            const response = await api.get<Story[]>('/stories/my-stories');
            setStories(response.data);
        } catch (error) {
            console.error('Failed to fetch stories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStory = async () => {
        if (!newStoryData.title.trim()) {
            alert('Le titre est requis');
            return;
        }

        try {
            const response = await api.post<Story>('/stories', {
                title: newStoryData.title,
                description: newStoryData.description,
                tags: newStoryData.tags.split(',').map(t => t.trim()).filter(Boolean),
                status: 'draft',
            });

            // Navigate to editor for the new story
            navigate(`/story/${response.data._id}/edit`);
        } catch (error) {
            console.error('Failed to create story:', error);
            alert('Erreur lors de la création de l\'histoire');
        }
    };

    const handleDeleteStory = async (storyId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette histoire ?')) {
            return;
        }

        try {
            await api.delete(`/stories/${storyId}`);
            setStories(stories.filter(s => s._id !== storyId));
        } catch (error) {
            console.error('Failed to delete story:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleToggleStatus = async (storyId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';

        try {
            await api.put(`/stories/${storyId}`, { status: newStatus });
            setStories(stories.map(s =>
                s._id === storyId ? { ...s, status: newStatus as 'draft' | 'published' } : s
            ));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Erreur lors du changement de statut');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-400 text-lg">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Tableau de Bord Auteur</h1>
                    <p className="text-gray-400">Gérez vos histoires interactives</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-2"
                >
                    <span className="text-xl">+</span>
                    Nouvelle Histoire
                </button>
            </div>

            {/* Create Story Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">Créer une Nouvelle Histoire</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Titre *</label>
                                <input
                                    type="text"
                                    value={newStoryData.title}
                                    onChange={(e) => setNewStoryData({ ...newStoryData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="Le titre de votre histoire"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Description</label>
                                <textarea
                                    value={newStoryData.description}
                                    onChange={(e) => setNewStoryData({ ...newStoryData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 h-24"
                                    placeholder="Une brève description..."
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Tags (séparés par des virgules)</label>
                                <input
                                    type="text"
                                    value={newStoryData.tags}
                                    onChange={(e) => setNewStoryData({ ...newStoryData, tags: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="fantasy, rpg, aventure"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleCreateStory}
                                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                            >
                                Créer
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewStoryData({ title: '', description: '', tags: '' });
                                }}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stories Grid */}
            {stories.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-bold text-white mb-2">Aucune histoire pour le moment</h3>
                    <p className="text-gray-400 mb-6">Créez votre première histoire interactive !</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                    >
                        Commencer
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stories.map((story) => (
                        <div
                            key={story._id}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-indigo-500 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white flex-1">{story.title}</h3>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${story.status === 'published'
                                            ? 'bg-green-900 text-green-300'
                                            : 'bg-gray-700 text-gray-300'
                                        }`}
                                >
                                    {story.status === 'published' ? 'Publié' : 'Brouillon'}
                                </span>
                            </div>

                            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                                {story.description || 'Aucune description'}
                            </p>

                            {/* Tags */}
                            {story.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {story.tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Stats */}
                            <div className="flex gap-4 text-sm text-gray-400 mb-4">
                                <span>👁️ {story.stats.views}</span>
                                <span>✅ {story.stats.completions}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/story/${story._id}/edit`)}
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold"
                                >
                                    ✏️ Éditer
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(story._id, story.status)}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                                >
                                    {story.status === 'published' ? '📥' : '🚀'}
                                </button>
                                <button
                                    onClick={() => handleDeleteStory(story._id)}
                                    className="px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg text-sm"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
