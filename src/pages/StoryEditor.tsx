import { useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type Edge,
    type Node,
    BackgroundVariant,
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    useReactFlow,
    type EdgeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import StoryNode from '../components/StoryNode';

// --- 1. Define custom types for our Node Data ---
interface StoryNodeData extends Record<string, unknown> {
    title: string;
    content: string;
    isEnding: boolean;
    choices: { text: string; targetPageId: string }[];
}

type TStoryNode = Node<StoryNodeData>;

// --- 2. Custom Edge Component for Editable Labels ---
const StoryEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    source,
    target,
}: EdgeProps) => {
    const { setEdges, setNodes } = useReactFlow();
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newText = event.target.value;

        // 1. Update the visual edge label
        setEdges((edges) =>
            edges.map((e) => {
                if (e.id === id) {
                    return { ...e, label: newText };
                }
                return e;
            })
        );

        // 2. Update the logical choice data in the source node
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === source) {
                    // Update the text of the choice that points to this target
                    const updatedChoices = (node.data.choices as any[]).map((choice) => {
                        if (choice.targetPageId === target) {
                            return { ...choice, text: newText };
                        }
                        return choice;
                    });

                    return {
                        ...node,
                        data: { ...node.data, choices: updatedChoices },
                    };
                }
                return node;
            })
        );
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <input
                        value={(label as string) || ''}
                        onChange={onLabelChange}
                        className="bg-gray-800 text-gray-200 text-[10px] px-2 py-1 rounded border border-gray-600 focus:border-indigo-500 outline-none w-20 text-center shadow-md transition-all focus:w-32 z-50"
                        placeholder="Action..."
                    />
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

const nodeTypes = {
    storyNode: StoryNode,
};

const edgeTypes = {
    storyEdge: StoryEdge,
};

const StoryEditor = () => {
    const { id: storyId } = useParams<{ id: string }>();

    const [nodes, setNodes, onNodesChange] = useNodesState<TStoryNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedNode, setSelectedNode] = useState<TStoryNode | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!storyId) return;

        const fetchStoryData = async () => {
            try {
                setLoading(true);
                // Mocking API call results
                const mockPages = [
                    { _id: '1', content: 'The start of the adventure.', isEnding: false, choices: [{ text: 'Go left', targetPageId: '2' }] },
                    { _id: '2', content: 'You found a fork in the road.', isEnding: false, choices: [{ text: 'Go deeper', targetPageId: '3' }] },
                    { _id: '3', content: 'The end of the story.', isEnding: true, choices: [] },
                ];

                const pages = mockPages as any[];

                const mappedNodes: TStoryNode[] = pages.map((page, index) => ({
                    id: page._id,
                    type: 'storyNode',
                    position: { x: (index % 3) * 300 + 50, y: Math.floor(index / 3) * 200 + 50 },
                    data: {
                        title: `Page ${index + 1}`,
                        content: page.content,
                        isEnding: page.isEnding,
                        choices: page.choices || [],
                    },
                }));

                const mappedEdges: Edge[] = [];
                pages.forEach((page) => {
                    page.choices.forEach((choice: { targetPageId: string; text: string; }, choiceIndex: number) => {
                        mappedEdges.push({
                            id: `e${page._id}-${choice.targetPageId}-${choiceIndex}`,
                            source: page._id,
                            target: choice.targetPageId,
                            type: 'storyEdge', // Use custom edge type
                            label: choice.text,
                        });
                    });
                });

                setNodes(mappedNodes);
                setEdges(mappedEdges);
            } catch (error) {
                console.error('Failed to fetch story data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStoryData();
    }, [storyId, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => {
            // 1. Create the Visual Edge with custom type
            const newEdge: Edge = {
                ...params,
                id: `e${params.source}-${params.target}-${Date.now()}`,
                type: 'storyEdge', // Use custom edge type
                label: 'Next',
                animated: true,
            };

            setEdges((eds) => addEdge(newEdge, eds));

            // 2. Update the Source Node's Data
            setNodes((nds) => nds.map((node) => {
                if (node.id === params.source && params.target) {
                    const newChoice = { text: 'Next', targetPageId: params.target };
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            choices: [...(node.data.choices || []), newChoice]
                        }
                    };
                }
                return node;
            }));

            console.log(`Connected ${params.source} to ${params.target}`);
        },
        [setEdges, setNodes],
    );

    const onNodeClick = useCallback((_event: React.MouseEvent, node: TStoryNode) => {
        setSelectedNode(node);
    }, []);

    const addPage = async () => {
        if (!storyId) return;
        try {
            const newPageData = {
                content: 'Write your story here...',
                isEnding: false,
                choices: []
            };

            const newPage = { _id: Date.now().toString(), content: newPageData.content, isEnding: newPageData.isEnding };

            const newNode: TStoryNode = {
                id: newPage._id,
                type: 'storyNode',
                position: { x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 },
                data: {
                    title: 'New Page',
                    content: newPage.content,
                    isEnding: newPage.isEnding,
                    choices: [],
                },
            };
            setNodes((nds) => [...nds, newNode]);
        } catch (error) {
            console.error('Failed to create page:', error);
        }
    };

    const handleUpdatePage = async (title: string, content: string) => {
        if (!selectedNode) return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            title,
                            content,
                        },
                    } as TStoryNode;
                }
                return node;
            })
        );

        setSelectedNode((prev) =>
            prev ? { ...prev, data: { ...prev.data, title, content } } : null
        );

        try {
            console.log(`Updated page ${selectedNode.id} content in UI.`);
        } catch (error) {
            console.error('Failed to update page:', error);
        }
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Loading story...</div>;
    }

    return (
        <div className="h-[calc(90dvh-64px)] w-full bg-gray-900 flex">
            {/* Sidebar / Toolbar */}
            <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col gap-4">
                <h2 className="text-xl font-bold text-white">Story Editor</h2>
                <button
                    onClick={addPage}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors"
                >
                    + Add Page
                </button>

                {selectedNode ? (
                    <div className="flex flex-col gap-3 mt-4 border-t border-gray-700 pt-4">
                        <h3 className="text-lg font-semibold text-white">Edit Page</h3>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Title (Local only)</label>
                            <input
                                type="text"
                                value={selectedNode.data.title}
                                onChange={(e) => handleUpdatePage(e.target.value, selectedNode.data.content)}
                                className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Content</label>
                            <textarea
                                value={selectedNode.data.content}
                                onChange={(e) => handleUpdatePage(selectedNode.data.title, e.target.value)}
                                className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-400 text-sm mt-4">
                        <p>Drag to move pages.</p>
                        <p>Connect handles to link choices.</p>
                        <p className="mt-2 text-indigo-400">Click a page to edit.</p>
                    </div>
                )}
            </div>

            {/* Canvas */}
            <div className="flex-1 h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    className="bg-gray-900"
                >
                    <Controls className="bg-white text-black" />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#374151" />
                </ReactFlow>
            </div>
        </div>
    );
};

export default StoryEditor;