import { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ReactFlow,
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
import { Button } from "../components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

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
                        className="bg-card text-card-foreground text-[10px] px-2 py-1 rounded border border-border focus:border-primary outline-none w-20 text-center shadow-md transition-all focus:w-32 z-50"
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

export function StoryFlowView() {
    const { id: storyId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [nodes, setNodes, onNodesChange] = useNodesState<TStoryNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedNode, setSelectedNode] = useState<TStoryNode | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!storyId) return;

        const fetchStoryData = async () => {
            try {
                setLoading(true);
                // Mocking API call results - In real app, fetch from API
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
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-background text-foreground">Loading story...</div>;
    }

    return (
        <div className="h-screen w-full bg-background flex flex-col">
             {/* Header */}
            <div className="border-b border-border/50 px-6 py-4 bg-card/50 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/editor/${storyId}`)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Editor
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <h2 className="font-semibold">Story Flow View</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={addPage}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Page
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar / Toolbar */}
                {selectedNode && (
                    <div className="w-80 bg-card border-r border-border p-4 flex flex-col gap-4 z-10 shadow-xl">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Edit Page</h3>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>Close</Button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Title (Local only)</label>
                                <input
                                    type="text"
                                    value={selectedNode.data.title}
                                    onChange={(e) => handleUpdatePage(e.target.value, selectedNode.data.content)}
                                    className="w-full bg-input text-foreground px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-border"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Content</label>
                                <textarea
                                    value={selectedNode.data.content}
                                    onChange={(e) => handleUpdatePage(selectedNode.data.title, e.target.value)}
                                    className="w-full bg-input text-foreground px-3 py-2 rounded text-sm h-32 focus:outline-none focus:ring-2 focus:ring-primary border border-border resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

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
                        className="bg-background"
                    >
                        <Controls className="bg-card text-foreground border-border" />
                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="currentColor" className="text-muted-foreground/20" />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
};
