import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ReactFlow,
    Controls,
    Background,
    type Connection,
    type NodeChange,
    type EdgeChange,
    BackgroundVariant,
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    useReactFlow,
    type EdgeProps,
    MiniMap,
    ReactFlowProvider,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import StoryNode from '../components/StoryNode';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, Plus, Save, Loader2, Trash2, Upload, AlertCircle } from 'lucide-react';
import { useStoryFlow, type TStoryNode } from '../hooks/useStoryFlow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { uploadService } from '../api/services';
import { ScrollArea } from '../components/ui/scroll-area';
import { Alert, AlertDescription } from '../components/ui/alert';

// --- Custom Edge Component for Editable Labels ---
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
    data,
}: EdgeProps) => {
    const { updateEdgeLabel } = data as any;
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
        if (updateEdgeLabel) {
            updateEdgeLabel(id, newText, source, target);
        }
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
                        className="bg-card text-card-foreground text-[10px] px-2 py-1 rounded border border-border focus:border-primary outline-none w-24 text-center shadow-md transition-all focus:w-40 z-50"
                        placeholder="Choice text..."
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

// Get node color based on ending type
const getNodeColor = (node: TStoryNode) => {
    if (!node.data.isEnding) return '#6366f1'; // Indigo for ongoing
    switch (node.data.endingType) {
        case 'success':
            return '#22c55e'; // Green
        case 'failure':
            return '#ef4444'; // Red
        default:
            return '#64748b'; // Gray
    }
};

function StoryFlowViewInner() {
    const { id: storyId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        story,
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
        handleNodesChange: customNodesChange,
        saveAll,
    } = useStoryFlow(storyId);

    const [selectedNode, setSelectedNode] = useState<TStoryNode | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const reactFlowInstance = useReactFlow();

    // React Flow's built-in change handlers
    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nds) => applyNodeChanges(changes, nds) as TStoryNode[]);
            customNodesChange(changes);
        },
        [setNodes, customNodesChange]
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            setEdges((eds) => applyEdgeChanges(changes, eds));
        },
        [setEdges]
    );

    const onConnect = useCallback(
        (params: Connection) => {
            handleConnect(params);
        },
        [handleConnect]
    );

    const onNodeClick = useCallback((_event: React.MouseEvent, node: TStoryNode) => {
        setSelectedNode(node);
    }, []);

    const handleAddPage = async () => {
        if (!storyId) return;

        // Get viewport center for smart positioning
        const viewport = reactFlowInstance.getViewport();
        const centerX = (-viewport.x + window.innerWidth / 2) / viewport.zoom;
        const centerY = (-viewport.y + window.innerHeight / 2) / viewport.zoom;

        await addPage({ x: centerX - 75, y: centerY - 50 });
    };

    const handleDeletePage = async () => {
        if (!selectedNode) return;

        const confirmDelete = window.confirm(
            `Are you sure you want to delete this page? This action cannot be undone.`
        );

        if (confirmDelete) {
            await deletePage(selectedNode.id);
            setSelectedNode(null);
        }
    };

    const handleUpdateContent = (content: string) => {
        if (!selectedNode) return;
        updateNodeData(selectedNode.id, { content });
        setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, content } } : null));
    };

    const handleUpdateEnding = (isEnding: boolean) => {
        if (!selectedNode) return;
        updateNodeData(selectedNode.id, { isEnding, endingType: isEnding ? 'neutral' : undefined });
        setSelectedNode((prev) =>
            prev ? { ...prev, data: { ...prev.data, isEnding, endingType: isEnding ? 'neutral' : undefined } } : null
        );
    };

    const handleUpdateEndingType = (endingType: 'success' | 'failure' | 'neutral') => {
        if (!selectedNode) return;
        updateNodeData(selectedNode.id, { endingType });
        setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, endingType } } : null));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !selectedNode) return;

        const file = e.target.files[0];
        try {
            setUploadingImage(true);
            const { url } = await uploadService.uploadImage(file);
            updateNodeData(selectedNode.id, { image: url });
            setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, image: url } } : null));
        } catch (error) {
            console.error('Failed to upload image:', error);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveImage = () => {
        if (!selectedNode) return;
        updateNodeData(selectedNode.id, { image: undefined });
        setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, image: undefined } } : null));
    };

    // Prepare edges with edge label update function
    const edgesWithData = edges.map((edge) => ({
        ...edge,
        data: { updateEdgeLabel },
    }));

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span>Loading story flow...</span>
                </div>
            </div>
        );
    }

    if (!story) {
        return (
            <div className="h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Story not found</h2>
                    <Button onClick={() => navigate('/my-stories')}>Back to My Stories</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-background flex flex-col">
            {/* Header */}
            <div className="border-b border-border/50 px-6 py-4 bg-card/50 backdrop-blur-sm flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/editor/${storyId}`)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Editor
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <div>
                        <h2 className="font-semibold text-lg">{story.title}</h2>
                        <p className="text-xs text-muted-foreground">Story Flow View</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {error && (
                        <Alert variant="destructive" className="py-2 px-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">{error}</AlertDescription>
                        </Alert>
                    )}
                    {saving && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                        </div>
                    )}
                    {!saving && !error && (
                        <span className="text-sm text-muted-foreground">All changes saved</span>
                    )}
                    <Button size="sm" variant="outline" onClick={saveAll} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        Save All
                    </Button>
                    <Button size="sm" onClick={handleAddPage}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Page
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Editor */}
                {selectedNode && (
                    <div className="w-96 bg-card border-r border-border flex flex-col z-10 shadow-xl">
                        <div className="p-4 border-b border-border flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Edit Page</h3>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                                Close
                            </Button>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-6">
                                {/* Page ID */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Page ID</Label>
                                    <div className="text-xs font-mono bg-muted px-2 py-1 rounded">{selectedNode.id}</div>
                                </div>

                                {/* Page Content */}
                                <div className="space-y-2">
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea
                                        id="content"
                                        value={selectedNode.data.content}
                                        onChange={(e) => handleUpdateContent(e.target.value)}
                                        className="min-h-[150px] resize-none"
                                        placeholder="Write your story content here..."
                                    />
                                </div>

                                {/* Page Image */}
                                <div className="space-y-2">
                                    <Label>Page Illustration</Label>
                                    {selectedNode.data.image ? (
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/50">
                                            <img
                                                src={selectedNode.data.image}
                                                alt="Page illustration"
                                                className="h-full w-full object-cover"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8"
                                                onClick={handleRemoveImage}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <label className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                            />
                                            {uploadingImage ? (
                                                <Loader2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-spin" />
                                            ) : (
                                                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                                {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                                            </p>
                                        </label>
                                    )}
                                </div>

                                {/* Ending Settings */}
                                <div className="space-y-4 border-t border-border pt-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="is-ending">Mark as Ending</Label>
                                            <p className="text-xs text-muted-foreground">
                                                This page concludes the story
                                            </p>
                                        </div>
                                        <Switch
                                            id="is-ending"
                                            checked={selectedNode.data.isEnding}
                                            onCheckedChange={handleUpdateEnding}
                                        />
                                    </div>

                                    {selectedNode.data.isEnding && (
                                        <div className="space-y-2">
                                            <Label htmlFor="ending-type">Ending Type</Label>
                                            <Select
                                                value={selectedNode.data.endingType || 'neutral'}
                                                onValueChange={(value) =>
                                                    handleUpdateEndingType(value as 'success' | 'failure' | 'neutral')
                                                }
                                            >
                                                <SelectTrigger className="bg-input border-border/50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="success">Success / Victory</SelectItem>
                                                    <SelectItem value="failure">Failure / Death</SelectItem>
                                                    <SelectItem value="neutral">Neutral</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                {/* Choices Display */}
                                {!selectedNode.data.isEnding && (
                                    <div className="space-y-2 border-t border-border pt-4">
                                        <Label>Choices ({selectedNode.data.choices.length})</Label>
                                        {selectedNode.data.choices.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedNode.data.choices.map((choice, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-2 bg-muted rounded text-sm border border-border/50"
                                                    >
                                                        <div className="font-medium text-xs text-muted-foreground mb-1">
                                                            Choice {index + 1}
                                                        </div>
                                                        <div className="text-foreground">{choice.text}</div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            → {choice.targetPageId.substring(0, 8)}...
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                Connect this page to others to create choices
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Delete Button */}
                                <div className="border-t border-border pt-4">
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={handleDeletePage}
                                        disabled={saving}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Page
                                    </Button>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {/* Canvas */}
                <div className="flex-1 h-full">
                    <ReactFlow
                        nodes={nodes}
                        edges={edgesWithData}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                        className="bg-background"
                        minZoom={0.1}
                        maxZoom={2}
                    >
                        <Controls className="bg-card text-foreground border-border" />
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={16}
                            size={1}
                            color="currentColor"
                            className="text-muted-foreground/20"
                        />
                        <MiniMap
                            nodeColor={getNodeColor}
                            className="bg-card border border-border"
                            maskColor="rgba(0,0,0,0.2)"
                        />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}

// Wrap with ReactFlowProvider
export function StoryFlowView() {
    return (
        <ReactFlowProvider>
            <StoryFlowViewInner />
        </ReactFlowProvider>
    );
}
