import { useState, useEffect, useCallback, useRef } from 'react';
import { addEdge, type Node, type Edge, type Connection } from '@xyflow/react';
import { storyService, pageService, type Page, type Story } from '../api/services';

// --- Types for Flow Nodes ---
interface StoryNodeData extends Record<string, unknown> {
    title: string;
    content: string;
    isEnding: boolean;
    endingType?: 'success' | 'failure' | 'neutral';
    image?: string;
    choices: { text: string; targetPageId: string }[];
}

export type TStoryNode = Node<StoryNodeData>;

// --- Utility Functions ---
const pageToNode = (page: Page, index: number, savedPositions?: Record<string, { x: number; y: number }>): TStoryNode => {
    // Use saved position if available, otherwise calculate default position
    const position = savedPositions?.[page._id] || {
        x: (index % 4) * 350 + 50,
        y: Math.floor(index / 4) * 250 + 50,
    };

    return {
        id: page._id,
        type: 'storyNode',
        position,
        data: {
            title: `Page ${index + 1}`,
            content: page.content,
            isEnding: page.isEnding,
            endingType: page.endingType,
            image: page.image,
            choices: page.choices || [],
        },
    };
};

const pagesToEdges = (pages: Page[]): Edge[] => {
    const edges: Edge[] = [];
    pages.forEach((page) => {
        page.choices.forEach((choice, choiceIndex) => {
            edges.push({
                id: `e${page._id}-${choice.targetPageId}-${choiceIndex}`,
                source: page._id,
                target: choice.targetPageId,
                type: 'storyEdge',
                label: choice.text,
                animated: false,
            });
        });
    });
    return edges;
};

// --- Custom Hook ---
export const useStoryFlow = (storyId: string | undefined) => {
    const [story, setStory] = useState<Story | null>(null);
    const [pages, setPages] = useState<Page[]>([]);
    const [nodes, setNodes] = useState<TStoryNode[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Track node positions locally
    const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>({});

    // Debounce timer for auto-save
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingUpdatesRef = useRef<Map<string, Partial<Page>>>(new Map());

    // --- Load Story and Pages ---
    const loadStoryData = useCallback(async () => {
        if (!storyId) return;

        try {
            setLoading(true);
            setError(null);

            const [storyData, pagesData] = await Promise.all([
                storyService.getStory(storyId),
                storyService.getPages(storyId),
            ]);

            setStory(storyData);
            setPages(pagesData);

            // Convert pages to nodes and edges
            const mappedNodes = pagesData.map((page, index) =>
                pageToNode(page, index, nodePositionsRef.current)
            );
            const mappedEdges = pagesToEdges(pagesData);

            setNodes(mappedNodes);
            setEdges(mappedEdges);
        } catch (err) {
            console.error('Failed to load story data:', err);
            setError('Failed to load story data');
        } finally {
            setLoading(false);
        }
    }, [storyId]);

    useEffect(() => {
        loadStoryData();
    }, [loadStoryData]);

    // --- Auto-save with debouncing ---
    const scheduleSave = useCallback(() => {
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }

        saveTimerRef.current = setTimeout(async () => {
            if (pendingUpdatesRef.current.size === 0) return;

            try {
                setSaving(true);

                // Save all pending updates
                const updates = Array.from(pendingUpdatesRef.current.entries());
                await Promise.all(
                    updates.map(([pageId, data]) => pageService.updatePage(pageId, data))
                );

                pendingUpdatesRef.current.clear();
            } catch (err) {
                console.error('Auto-save failed:', err);
                setError('Failed to save changes');
            } finally {
                setSaving(false);
            }
        }, 1500); // 1.5 second debounce
    }, []);

    // --- Update Node Data ---
    const updateNodeData = useCallback((nodeId: string, updates: Partial<StoryNodeData>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    const newData = { ...node.data, ...updates };

                    // Queue update for backend
                    const pageUpdate: Partial<Page> = {
                        content: newData.content,
                        isEnding: newData.isEnding,
                        endingType: newData.endingType,
                        image: newData.image,
                        choices: newData.choices,
                    };

                    pendingUpdatesRef.current.set(nodeId, {
                        ...pendingUpdatesRef.current.get(nodeId),
                        ...pageUpdate,
                    });
                    scheduleSave();

                    return { ...node, data: newData };
                }
                return node;
            })
        );

        // Update pages state as well
        setPages((pgs) =>
            pgs.map((page) => {
                if (page._id === nodeId) {
                    return {
                        ...page,
                        ...updates,
                    };
                }
                return page;
            })
        );
    }, [scheduleSave]);

    // --- Add New Page ---
    const addPage = useCallback(async (position?: { x: number; y: number }) => {
        if (!storyId) return;

        try {
            setSaving(true);
            const newPage = await pageService.createPage(storyId, {
                content: 'Write your story here...',
                isEnding: false,
                choices: [],
            });

            setPages((pgs) => [...pgs, newPage]);

            const newNode = pageToNode(
                newPage,
                pages.length,
                position ? { [newPage._id]: position } : undefined
            );
            setNodes((nds) => [...nds, newNode]);

            return newPage;
        } catch (err) {
            console.error('Failed to create page:', err);
            setError('Failed to create page');
        } finally {
            setSaving(false);
        }
    }, [storyId, pages.length]);

    // --- Delete Page ---
    const deletePage = useCallback(async (pageId: string) => {
        try {
            setSaving(true);
            await pageService.deletePage(pageId);

            setPages((pgs) => pgs.filter((p) => p._id !== pageId));
            setNodes((nds) => nds.filter((n) => n.id !== pageId));

            // Remove edges connected to this page
            setEdges((eds) => eds.filter((e) => e.source !== pageId && e.target !== pageId));

            // Remove from pending updates if present
            pendingUpdatesRef.current.delete(pageId);
        } catch (err) {
            console.error('Failed to delete page:', err);
            setError('Failed to delete page');
        } finally {
            setSaving(false);
        }
    }, []);

    // --- Handle Connection (Choice Creation) ---
    const handleConnect = useCallback((params: Connection) => {
        if (!params.source || !params.target) return;

        // Create visual edge
        const newEdge: Edge = {
            ...params,
            id: `e${params.source}-${params.target}-${Date.now()}`,
            type: 'storyEdge',
            label: 'Next',
            animated: false,
        };

        setEdges((eds) => addEdge(newEdge, eds));

        // Update source node's choices
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === params.source && params.target) {
                    const newChoice = { text: 'Next', targetPageId: params.target };
                    const updatedChoices = [...(node.data.choices || []), newChoice];

                    // Queue update for backend
                    pendingUpdatesRef.current.set(node.id, {
                        ...pendingUpdatesRef.current.get(node.id),
                        choices: updatedChoices,
                    });
                    scheduleSave();

                    return {
                        ...node,
                        data: { ...node.data, choices: updatedChoices },
                    };
                }
                return node;
            })
        );

        // Update pages state
        setPages((pgs) =>
            pgs.map((page) => {
                if (page._id === params.source && params.target) {
                    return {
                        ...page,
                        choices: [...page.choices, { text: 'Next', targetPageId: params.target }],
                    };
                }
                return page;
            })
        );
    }, [scheduleSave]);

    // --- Update Edge Label (Choice Text) ---
    const updateEdgeLabel = useCallback((edgeId: string, newLabel: string, sourceId: string, targetId: string) => {
        // Update visual edge
        setEdges((eds) =>
            eds.map((e) => {
                if (e.id === edgeId) {
                    return { ...e, label: newLabel };
                }
                return e;
            })
        );

        // Update source node's choice text
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === sourceId) {
                    const updatedChoices = node.data.choices.map((choice) => {
                        if (choice.targetPageId === targetId) {
                            return { ...choice, text: newLabel };
                        }
                        return choice;
                    });

                    // Queue update for backend
                    pendingUpdatesRef.current.set(node.id, {
                        ...pendingUpdatesRef.current.get(node.id),
                        choices: updatedChoices,
                    });
                    scheduleSave();

                    return {
                        ...node,
                        data: { ...node.data, choices: updatedChoices },
                    };
                }
                return node;
            })
        );

        // Update pages state
        setPages((pgs) =>
            pgs.map((page) => {
                if (page._id === sourceId) {
                    return {
                        ...page,
                        choices: page.choices.map((choice) =>
                            choice.targetPageId === targetId ? { ...choice, text: newLabel } : choice
                        ),
                    };
                }
                return page;
            })
        );
    }, [scheduleSave]);

    // --- Track Node Position Changes ---
    const handleNodesChange = useCallback((changes: any[]) => {
        changes.forEach((change) => {
            if (change.type === 'position' && change.position) {
                nodePositionsRef.current[change.id] = change.position;
            }
        });
    }, []);

    // --- Manual Save All ---
    const saveAll = useCallback(async () => {
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }

        if (pendingUpdatesRef.current.size === 0) return;

        try {
            setSaving(true);

            const updates = Array.from(pendingUpdatesRef.current.entries());
            await Promise.all(
                updates.map(([pageId, data]) => pageService.updatePage(pageId, data))
            );

            pendingUpdatesRef.current.clear();
        } catch (err) {
            console.error('Save failed:', err);
            setError('Failed to save changes');
            throw err;
        } finally {
            setSaving(false);
        }
    }, []);

    return {
        story,
        pages,
        nodes,
        edges,
        loading,
        saving,
        error,
        setNodes,
        setEdges,
        updateNodeData,
        addPage,
        deletePage,
        handleConnect,
        updateEdgeLabel,
        handleNodesChange,
        saveAll,
        reload: loadStoryData,
    };
};
