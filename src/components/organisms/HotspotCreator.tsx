import { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Button } from '../atoms/button';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';
import { Trash2, Save, Plus, MousePointerClick } from 'lucide-react';
import type { Hotspot, Dimensions } from '../../utils/mathUtils';
import { pixelsToPercentage, percentageToPixels } from '../../utils/mathUtils';
import { Card } from '../atoms/card';

interface HotspotCreatorProps {
    imageUrl: string;
    initialHotspots?: Hotspot[];
    onSave: (hotspots: Hotspot[]) => void;
    availablePages?: { id: string; title: string }[];
}

export function HotspotCreator({ imageUrl, initialHotspots = [], onSave, availablePages = [] }: HotspotCreatorProps) {
    const [hotspots, setHotspots] = useState<Hotspot[]>(initialHotspots);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerDimensions, setContainerDimensions] = useState<Dimensions>({ width: 0, height: 0 });

    // Update container dimensions on mount and resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { offsetWidth, offsetHeight } = containerRef.current;
                setContainerDimensions({ width: offsetWidth, height: offsetHeight });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        // Also update when image loads
        const img = containerRef.current?.querySelector('img');
        if (img) {
            img.onload = updateDimensions;
        }

        return () => window.removeEventListener('resize', updateDimensions);
    }, [imageUrl]);

    const handleAddHotspot = () => {
        if (!containerDimensions.width) return;

        // Add a default 20% x 20% box in the center
        const newHotspot: Hotspot = {
            x: 40,
            y: 40,
            width: 20,
            height: 20,
            targetPageId: '',
            label: 'New Zone'
        };

        setHotspots([...hotspots, newHotspot]);
        setSelectedId(hotspots.length); // Select the new hotspot
    };

    const handleUpdateHotspot = (index: number, newRect: any) => {
        const updatedHotspots = [...hotspots];
        // Convert pixels back to percentages for storage
        const percentageRect = pixelsToPercentage(
            { x: newRect.x, y: newRect.y, width: newRect.width, height: newRect.height },
            containerDimensions
        );

        updatedHotspots[index] = {
            ...updatedHotspots[index],
            ...percentageRect
        };
        setHotspots(updatedHotspots);
    };

    const handleDeleteHotspot = (index: number) => {
        const updatedHotspots = hotspots.filter((_, i) => i !== index);
        setHotspots(updatedHotspots);
        setSelectedId(null);
    };

    const handleSave = () => {
        console.log("HotspotCreator: handleSave clicked", hotspots);
        onSave(hotspots);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MousePointerClick className="w-5 h-5 text-emerald-500" />
                    Interactive Zones
                </h3>
                <div className="flex gap-2">
                    <Button onClick={handleAddHotspot} variant="outline" size="sm" className="gap-2">
                        <Plus className="w-4 h-4" /> Add Zone
                    </Button>
                    <Button onClick={handleSave} size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                        <Save className="w-4 h-4" /> Save Zones
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Image Editor Area */}
                <div className="lg:col-span-2 relative bg-slate-900/50 rounded-lg border border-white/10 overflow-hidden" ref={containerRef}>
                    {imageUrl ? (
                        <div className="relative w-full h-full min-h-[400px]">
                            <img
                                src={imageUrl}
                                alt="Story background"
                                className="w-full h-auto object-contain select-none pointer-events-none"
                            />

                            {/* Render Hotspots */}
                            {containerDimensions.width > 0 && hotspots.map((hotspot, index) => {
                                const pixelRect = percentageToPixels(hotspot, containerDimensions);
                                const isSelected = selectedId === index;

                                return (
                                    <Rnd
                                        key={index}
                                        size={{ width: pixelRect.width, height: pixelRect.height }}
                                        position={{ x: pixelRect.x, y: pixelRect.y }}
                                        onDragStop={(_e, d) => {
                                            handleUpdateHotspot(index, { ...pixelRect, x: d.x, y: d.y });
                                            setSelectedId(index);
                                        }}
                                        onResizeStop={(_e, _direction, ref, _delta, position) => {
                                            handleUpdateHotspot(index, {
                                                width: parseInt(ref.style.width),
                                                height: parseInt(ref.style.height),
                                                x: position.x,
                                                y: position.y
                                            });
                                            setSelectedId(index);
                                        }}
                                        onClick={() => setSelectedId(index)}
                                        bounds="parent"
                                        className={`border-2 ${isSelected ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/50 bg-white/10'} hover:border-emerald-400 transition-colors cursor-move`}
                                    >
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-white drop-shadow-md bg-black/50 px-1 rounded">
                                                {index + 1}
                                            </span>
                                        </div>
                                    </Rnd>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                            No image available. Upload an image first.
                        </div>
                    )}
                </div>

                {/* Properties Panel */}
                <div className="space-y-4">
                    <Card className="p-4 bg-card/50 backdrop-blur-sm">
                        <h4 className="font-medium mb-4">Zone Properties</h4>
                        {selectedId !== null && hotspots[selectedId] ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Label</Label>
                                    <Input
                                        value={hotspots[selectedId].label || ''}
                                        onChange={(e) => {
                                            const updated = [...hotspots];
                                            updated[selectedId] = { ...updated[selectedId], label: e.target.value };
                                            setHotspots(updated);
                                        }}
                                        placeholder="e.g. Open Door"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Page ID (Success)</Label>
                                    {availablePages.length > 0 ? (
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={hotspots[selectedId].targetPageId || ''}
                                            onChange={(e) => {
                                                const updated = [...hotspots];
                                                updated[selectedId] = { ...updated[selectedId], targetPageId: e.target.value };
                                                setHotspots(updated);
                                            }}
                                        >
                                            <option value="">Select a page...</option>
                                            {availablePages.map(page => (
                                                <option key={page.id} value={page.id}>
                                                    {page.title || `Page ${page.id.substring(0, 6)}...`}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input
                                            value={hotspots[selectedId].targetPageId || ''}
                                            onChange={(e) => {
                                                const updated = [...hotspots];
                                                updated[selectedId] = { ...updated[selectedId], targetPageId: e.target.value };
                                                setHotspots(updated);
                                            }}
                                            placeholder="Enter Page ID"
                                        />
                                    )}
                                </div>

                                <div className="pt-4 border-t border-white/10 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="diceRollEnabled"
                                            checked={hotspots[selectedId].diceRoll?.enabled || false}
                                            onChange={(e) => {
                                                const updated = [...hotspots];
                                                const currentDiceRoll = updated[selectedId].diceRoll || { enabled: false, difficulty: 10, type: 'combat' };
                                                updated[selectedId] = {
                                                    ...updated[selectedId],
                                                    diceRoll: { ...currentDiceRoll, enabled: e.target.checked }
                                                };
                                                setHotspots(updated);
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <Label htmlFor="diceRollEnabled" className="cursor-pointer">Require Dice Roll</Label>
                                    </div>

                                    {hotspots[selectedId].diceRoll?.enabled && (
                                        <div className="space-y-3 pl-6 border-l-2 border-emerald-500/30">
                                            <div className="space-y-2">
                                                <Label>Difficulty (DC)</Label>
                                                <Input
                                                    type="number"
                                                    value={hotspots[selectedId].diceRoll?.difficulty || 10}
                                                    onChange={(e) => {
                                                        const updated = [...hotspots];
                                                        updated[selectedId] = {
                                                            ...updated[selectedId],
                                                            diceRoll: { ...updated[selectedId].diceRoll!, difficulty: parseInt(e.target.value) || 10 }
                                                        };
                                                        setHotspots(updated);
                                                    }}
                                                    min={1}
                                                    max={20}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Type</Label>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={hotspots[selectedId].diceRoll?.type || 'combat'}
                                                    onChange={(e) => {
                                                        const updated = [...hotspots];
                                                        updated[selectedId] = {
                                                            ...updated[selectedId],
                                                            diceRoll: { ...updated[selectedId].diceRoll!, type: e.target.value as any }
                                                        };
                                                        setHotspots(updated);
                                                    }}
                                                >
                                                    <option value="combat">Combat</option>
                                                    <option value="stealth">Stealth (Fuite)</option>
                                                    <option value="persuasion">Persuasion</option>
                                                    <option value="custom">Custom</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Failure Page ID (Optional)</Label>
                                                {availablePages.length > 0 ? (
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        value={hotspots[selectedId].diceRoll?.failurePageId || ''}
                                                        onChange={(e) => {
                                                            const updated = [...hotspots];
                                                            updated[selectedId] = {
                                                                ...updated[selectedId],
                                                                diceRoll: { ...updated[selectedId].diceRoll!, failurePageId: e.target.value }
                                                            };
                                                            setHotspots(updated);
                                                        }}
                                                    >
                                                        <option value="">Stay on current page</option>
                                                        {availablePages.map(page => (
                                                            <option key={page.id} value={page.id}>
                                                                {page.title || `Page ${page.id.substring(0, 6)}...`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <Input
                                                        value={hotspots[selectedId].diceRoll?.failurePageId || ''}
                                                        onChange={(e) => {
                                                            const updated = [...hotspots];
                                                            updated[selectedId] = {
                                                                ...updated[selectedId],
                                                                diceRoll: { ...updated[selectedId].diceRoll!, failurePageId: e.target.value }
                                                            };
                                                            setHotspots(updated);
                                                        }}
                                                        placeholder="Enter Page ID"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full gap-2"
                                        onClick={() => handleDeleteHotspot(selectedId)}
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete Zone
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-8">
                                Select a zone to edit its properties
                            </div>
                        )}
                    </Card>

                    <div className="text-xs text-muted-foreground p-2">
                        <p><strong>Tip:</strong> Drag to move, grab corners to resize.</p>
                        <p>Zones are saved as percentages so they work on all screen sizes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
