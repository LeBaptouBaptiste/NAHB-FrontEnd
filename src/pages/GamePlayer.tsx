import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { gameService, pageService } from '../api/services';
import type { GameSession, Page, PathStats } from '../api/services';
import DiceRoller from '../components/DiceRoller';
import { HotspotLayer } from '../components/HotspotLayer';
import type { Hotspot } from '../utils/mathUtils';

interface PlayerClass {
    name: string;
    combatBonus: number;
    fleeBonus: number;
}

const CLASSES: Record<string, PlayerClass> = {
    'GUERRIER': { name: 'Guerrier', combatBonus: 3, fleeBonus: -2 },
    'MAGE': { name: 'Mage', combatBonus: 1, fleeBonus: 1 },
    'ASSASSIN': { name: 'Assassin', combatBonus: 1, fleeBonus: 4 },
};

const GamePlayer = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();

    const [session, setSession] = useState<GameSession | null>(null);
    const [currentPage, setCurrentPage] = useState<Page | null>(null);
    const [playerClass, setPlayerClass] = useState<PlayerClass | null>(null);
    const [inventory, setInventory] = useState<string[]>([]); // Track collected items
    const [statBuffs, setStatBuffs] = useState({ combat: 0, flee: 0 }); // Track temporary bonuses
    const [loading, setLoading] = useState(true);
    const [showDiceRoll, setShowDiceRoll] = useState(false);
    const [pendingChoice, setPendingChoice] = useState<number | null>(null);
    const [pendingHotspot, setPendingHotspot] = useState<Hotspot | null>(null);
    const [diceConfig, setDiceConfig] = useState<{ difficulty: number; type: 'combat' | 'flee' | 'stealth' | 'persuasion' | 'custom' } | null>(null);
    const [pathStats, setPathStats] = useState<PathStats | null>(null);
    const [pathStatsLoading, setPathStatsLoading] = useState(false);

    useEffect(() => {
        const loadSession = async () => {
            try {
                setLoading(true);
                const sessionData = await gameService.getSession(sessionId!);
                setSession(sessionData);

                const pageData = await pageService.getPage(sessionData.currentPageId);
                setCurrentPage(pageData);
            } catch (error) {
                console.error('Failed to load session:', error);
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) {
            loadSession();
        }
    }, [sessionId]);

    // Charge les statistiques de parcours lorsqu'on atteint une fin
    useEffect(() => {
        if (!session || !currentPage?.isEnding || pathStats || pathStatsLoading) return;

        const loadPathStats = async () => {
            try {
                setPathStatsLoading(true);
                const stats = await gameService.getPathStats(session._id);
                setPathStats(stats);
            } catch (error) {
                console.error('Failed to load path stats:', error);
            } finally {
                setPathStatsLoading(false);
            }
        };

        loadPathStats();
    }, [session, currentPage, pathStats, pathStatsLoading]);

    const handleClassSelection = (className: string) => {
        setPlayerClass(CLASSES[className]);
    };

    const handleChoice = async (choiceIndex: number, choiceText: string) => {
        if (!session || !currentPage) return;

        // Check if this is a dice roll choice (but not an outcome choice like "≥18")
        const isOutcomeChoice = choiceText.match(/^[[<≥\d]/); // Starts with [, <, ≥, or digit
        const isDiceRoll = (choiceText.includes('1d20') || choiceText.includes('[COMBAT') || choiceText.includes('[FUITE')) && !isOutcomeChoice;

        if (isDiceRoll) {
            // Extract difficulty from choice text (e.g., "≥15" or "≥12")
            const difficultyMatch = choiceText.match(/≥(\d+)/);
            const difficulty = difficultyMatch ? parseInt(difficultyMatch[1]) : 15;

            // Determine if it's combat or flee
            const type = choiceText.includes('[FUITE') || choiceText.includes('Fuir') ? 'flee' : 'combat';

            setPendingChoice(choiceIndex);
            setDiceConfig({ difficulty, type });
            setShowDiceRoll(true);
        } else {
            // No dice roll needed, proceed directly
            await makeChoice(choiceIndex);
        }
    };

    const handleDiceResult = async (_success: boolean, _roll: number, total: number) => {
        setShowDiceRoll(false);

        if (!currentPage) return;

        if (pendingHotspot) {
            // Handle hotspot result
            const success = total >= (pendingHotspot.diceRoll?.difficulty || 10);
            const targetId = success ? pendingHotspot.targetPageId : pendingHotspot.diceRoll?.failurePageId;

            if (targetId) {
                // Find choice leading to this target
                const choiceIndex = currentPage.choices.findIndex(c => c.targetPageId === targetId);
                if (choiceIndex !== -1) {
                    await makeChoice(choiceIndex);
                } else {
                    // If no choice exists, we might need to force navigation or show error
                    // For now, let's try to find ANY choice that might work or just log
                    console.warn(`No choice found for target ${targetId} after hotspot roll`);
                }
            }
            setPendingHotspot(null);
            setDiceConfig(null);
            return;
        }

        // Find the appropriate outcome choice based on dice roll result
        // Look for choices with difficulty numbers like "[≥18]", "[14-17]", "[<14]"
        const outcomeChoices = currentPage.choices.map((choice, idx) => ({
            index: idx,
            text: choice.text,
            minMatch: choice.text.match(/≥(\d+)/),
            rangeMatch: choice.text.match(/(\d+)-(\d+)/),
            maxMatch: choice.text.match(/<(\d+)/),
        }));

        // Find matching outcome based on total roll
        let selectedOutcomeIndex = pendingChoice ?? 0; // Default to original choice or 0

        for (const outcome of outcomeChoices) {
            // Check for ≥X pattern (success threshold)
            if (outcome.minMatch) {
                const threshold = parseInt(outcome.minMatch[1]);
                if (total >= threshold) {
                    selectedOutcomeIndex = outcome.index;
                    break;
                }
            }
            // Check for X-Y range pattern
            else if (outcome.rangeMatch) {
                const min = parseInt(outcome.rangeMatch[1]);
                const max = parseInt(outcome.rangeMatch[2]);
                if (total >= min && total <= max) {
                    selectedOutcomeIndex = outcome.index;
                    break;
                }
            }
            // Check for <X pattern (failure threshold)
            else if (outcome.maxMatch) {
                const threshold = parseInt(outcome.maxMatch[1]);
                if (total < threshold) {
                    selectedOutcomeIndex = outcome.index;
                    break;
                }
            }
        }

        await makeChoice(selectedOutcomeIndex);
        setPendingChoice(null);
        setDiceConfig(null);
    };

    const makeChoice = async (choiceIndex: number, hotspotIndex?: number) => {
        if (!session || !currentPage) return;

        try {
            // Check if choice grants items or buffs (only for regular choices)
            if (choiceIndex !== -1) {
                const choiceText = currentPage.choices[choiceIndex]?.text || '';

                // Detect item collection
                if (choiceText.includes('potion') || choiceText.includes('Prendre la potion')) {
                    setInventory(prev => [...prev, 'potion']);
                }
                if (choiceText.includes('médaillon') || choiceText.includes('Prendre le médaillon')) {
                    setInventory(prev => [...prev, 'medallion']);
                }
                if (choiceText.includes('Prendre tout')) {
                    setInventory(prev => [...prev, 'potion', 'medallion', 'stone']);
                }
                if (choiceText.includes('dague de qualité')) {
                    setInventory(prev => [...prev, 'superior_dagger']);
                    setStatBuffs(prev => ({ ...prev, combat: prev.combat + 2 }));
                }
            }

            const response = await gameService.makeChoice(session._id, choiceIndex, hotspotIndex);

            setSession(response);

            const pageData = await pageService.getPage(response.currentPageId);
            setCurrentPage(pageData);
        } catch (error) {
            console.error('Failed to make choice:', error);
        }
    };

    const handleRestart = async () => {
        if (!session) return;

        try {
            const response = await gameService.startSession(session.storyId);
            navigate(`/play/${response._id}`);
        } catch (error) {
            console.error('Failed to restart:', error);
        }
    };

    const handleBackToLibrary = () => {
        navigate('/stories');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-400 text-lg">Chargement...</div>
            </div>
        );
    }

    if (!session || !currentPage) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="text-gray-400 text-lg">Session introuvable</div>
                <button
                    onClick={handleBackToLibrary}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                    Retour à la bibliothèque
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header with Class Info */}
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">
                    {playerClass ? `${playerClass.name}` : 'Aventure Interactive'}
                </h1>
                <div className="flex gap-2">
                    {playerClass && (
                        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                            <span className="text-gray-400 text-sm">Combat: </span>
                            <span className="text-green-400 font-bold">
                                {playerClass.combatBonus >= 0 ? '+' : ''}{playerClass.combatBonus}
                                {statBuffs.combat > 0 && <span className="text-yellow-400">+{statBuffs.combat}</span>}
                            </span>
                            <span className="text-gray-400 text-sm ml-3">Fuite: </span>
                            <span className={`font-bold ${(playerClass.fleeBonus + statBuffs.flee) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {playerClass.fleeBonus >= 0 ? '+' : ''}{playerClass.fleeBonus}
                                {statBuffs.flee > 0 && <span className="text-yellow-400">+{statBuffs.flee}</span>}
                            </span>
                        </div>
                    )}
                    {inventory.length > 0 && (
                        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                            <span className="text-gray-400 text-sm">Sac: </span>
                            <span className="text-blue-400 font-bold">
                                {inventory.map(item => {
                                    if (item === 'potion') return '🧪';
                                    if (item === 'medallion') return '🧿';
                                    if (item === 'stone') return '🪨';
                                    if (item === 'superior_dagger') return '🗡️';
                                    return '📦';
                                }).join(' ')}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={handleBackToLibrary}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                    >
                        Bibliothèque
                    </button>
                </div>
            </div>


            {/* Grid Layout: Image (Left 2/3) + Content & Choices (Right 1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Image Section - Takes 2 columns on large screens (left) */}
                {currentPage.image && (
                    <div className="lg:col-span-2">
                        <div className="rounded-lg overflow-hidden border border-gray-700 sticky top-6 relative">
                            {/* Hotspot Layer */}
                            {currentPage.hotspots && currentPage.hotspots.length > 0 && (
                                <div className="absolute inset-0 z-10">
                                    <HotspotLayer
                                        imageUrl={currentPage.image}
                                        hotspots={currentPage.hotspots}
                                        onHotspotClick={async (hotspot: Hotspot) => {
                                            if (!session) return;

                                            // Check for dice roll requirement
                                            if (hotspot.diceRoll?.enabled) {
                                                setDiceConfig({
                                                    difficulty: hotspot.diceRoll.difficulty || 10,
                                                    type: hotspot.diceRoll.type || 'combat'
                                                });
                                                setPendingHotspot(hotspot);
                                                setShowDiceRoll(true);
                                                return;
                                            }

                                            // Direct navigation via hotspot index
                                            // We need to find the index of this hotspot in the current page's hotspots array
                                            const hotspotIndex = currentPage.hotspots?.findIndex(h =>
                                                h.x === hotspot.x && h.y === hotspot.y && h.width === hotspot.width && h.height === hotspot.height
                                            );

                                            if (hotspotIndex !== undefined && hotspotIndex !== -1) {
                                                await makeChoice(-1, hotspotIndex); // Pass -1 for choiceIndex, and the real hotspotIndex
                                            } else {
                                                console.warn(`Hotspot not found in page data`);
                                            }
                                        }}
                                    />
                                </div>
                            )}
                            <img
                                src={currentPage.image}
                                alt="Scene"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* Right Column: Content + Choices stacked vertically */}
                <div className={`${currentPage.image ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-6`}>
                    {/* Page Content */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <div className="prose prose-invert prose-emerald max-w-none text-gray-300">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({ ...props }) => <h1 className="text-3xl font-bold text-emerald-400 mb-4" {...props} />,
                                    h2: ({ ...props }) => <h2 className="text-2xl font-bold text-emerald-400 mb-3" {...props} />,
                                    h3: ({ ...props }) => <h3 className="text-xl font-semibold text-emerald-400 mb-2" {...props} />,
                                    h4: ({ ...props }) => <h4 className="text-lg font-semibold text-emerald-400 mb-2" {...props} />,
                                    p: ({ ...props }) => <p className="text-gray-300 mb-3 leading-relaxed" {...props} />,
                                    strong: ({ ...props }) => <strong className="text-emerald-300 font-bold" {...props} />,
                                    em: ({ ...props }) => <em className="text-emerald-200 italic" {...props} />,
                                    a: ({ ...props }) => <a className="text-emerald-400 hover:text-emerald-300 underline" {...props} />,
                                    ul: ({ ...props }) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-300" {...props} />,
                                    ol: ({ ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-300" {...props} />,
                                    li: ({ ...props }) => <li className="text-gray-300" {...props} />,
                                    blockquote: ({ ...props }) => (
                                        <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-emerald-200 my-4 py-2 bg-emerald-500/5 rounded-r" {...props} />
                                    ),
                                    code: ({ className, children, ...props }) => {
                                        const isInline = !className?.includes('language-');
                                        return isInline
                                            ? <code className="bg-gray-700 text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                                            : <code className="block bg-gray-900 text-emerald-300 p-4 rounded my-3 overflow-x-auto font-mono text-sm" {...props}>{children}</code>;
                                    },
                                    hr: ({ ...props }) => <hr className="border-gray-600 my-6" {...props} />,
                                    table: ({ ...props }) => (
                                        <div className="overflow-x-auto my-4">
                                            <table className="min-w-full border border-gray-600 rounded" {...props} />
                                        </div>
                                    ),
                                    thead: ({ ...props }) => <thead className="bg-gray-700" {...props} />,
                                    th: ({ ...props }) => <th className="border border-gray-600 px-4 py-2 text-emerald-400 font-semibold" {...props} />,
                                    td: ({ ...props }) => <td className="border border-gray-600 px-4 py-2 text-gray-300" {...props} />,
                                }}
                            >
                                {currentPage.content}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Dice Roller (in right column below content) */}
                    {showDiceRoll && diceConfig && playerClass && (
                        <DiceRoller
                            difficulty={diceConfig.difficulty}
                            bonus={
                                diceConfig.type === 'combat' ? (playerClass.combatBonus + statBuffs.combat) :
                                    (diceConfig.type === 'flee' || diceConfig.type === 'stealth') ? (playerClass.fleeBonus + statBuffs.flee) :
                                        0 // No bonus for persuasion/custom yet
                            }
                            bonusLabel={
                                diceConfig.type === 'combat' ? 'Combat' :
                                    (diceConfig.type === 'flee' || diceConfig.type === 'stealth') ? 'Fuite/Discrétion' :
                                        diceConfig.type === 'persuasion' ? 'Persuasion' : 'Custom'
                            }
                            onResult={handleDiceResult}
                        />
                    )}
                    {/* Choices Section */}
                    {!currentPage.isEnding && !showDiceRoll && (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sticky top-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Que fais-tu ?</h3>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                {currentPage.choices.map((choice, index) => {
                                    // Hide outcome choices (they're handled by dice rolls)
                                    const isOutcomeChoice = choice.text.match(/^[[<≥\d]/); // Starts with [, <, ≥, or digit
                                    if (isOutcomeChoice) {
                                        return null; // Don't display outcome choices as buttons
                                    }

                                    // Check if choice is class-specific
                                    const isClassChoice = choice.text.includes('[GUERRIER]') ||
                                        choice.text.includes('[MAGE]') ||
                                        choice.text.includes('[ASSASSIN]');

                                    // If class-specific, check if it matches player's class
                                    const matchesClass = !isClassChoice ||
                                        (playerClass && choice.text.includes(`[${playerClass.name.toUpperCase()}]`));

                                    // For class selection page (no player class yet)
                                    const isClassSelectionChoice = choice.text.includes('Choisir');

                                    if (!matchesClass && !isClassSelectionChoice && playerClass) {
                                        return null; // Hide non-matching class choices
                                    }

                                    // Clean up choice text
                                    const displayText = choice.text
                                        .replace('[GUERRIER]', '')
                                        .replace('[MAGE]', '')
                                        .replace('[ASSASSIN]', '')
                                        .replace('[COMBAT]', '⚔️')
                                        .replace('[FUITE]', '🏃')
                                        .replace(/\[COMBAT [ÉÉE]CHEC\]/gi, '') // Remove [COMBAT ÉCHEC]
                                        .replace(/\[FUITE [ÉÉE]CHEC\]/gi, '') // Remove [FUITE ÉCHEC]
                                        .replace(/\[[≥<]\d+\]/g, '') // Remove [≥18], [<14], etc.
                                        .replace(/\[\d+-\d+\]/g, '') // Remove [14-17]
                                        .trim();

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                // Handle class selection
                                                if (isClassSelectionChoice) {
                                                    if (choice.text.includes('GUERRIER')) handleClassSelection('GUERRIER');
                                                    else if (choice.text.includes('MAGE')) handleClassSelection('MAGE');
                                                    else if (choice.text.includes('ASSASSIN')) handleClassSelection('ASSASSIN');
                                                }
                                                handleChoice(index, choice.text);
                                            }}
                                            className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-indigo-600 border border-gray-600 hover:border-indigo-500 rounded-lg transition-all text-white text-sm"
                                        >
                                            <span className="font-medium">{displayText}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Ending Screen (in right column) */}
                    {currentPage.isEnding && (
                        <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-8 text-center">
                            <div className="text-6xl mb-4">
                                {currentPage.endingType === 'success' ? '🏆' : '💀'}
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">
                                {currentPage.endingType === 'success' ? 'VICTOIRE !' : 'GAME OVER'}
                            </h2>
                            <div className="flex flex-col gap-3 mt-6">
                                <button
                                    onClick={handleRestart}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                                >
                                    Recommencer
                                </button>
                                <button
                                    onClick={handleBackToLibrary}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold"
                                >
                                    Bibliothèque
                                </button>
                            </div>

                            {/* Path statistics */}
                            <div className="mt-8 text-sm text-gray-300 text-left">
                                {pathStatsLoading && (
                                    <p className="text-gray-400">Calcul des statistiques de votre parcours...</p>
                                )}
                                {pathStats && (
                                    <div className="space-y-3">
                                        <p>{pathStats.samePathStats.message}</p>
                                        <p className="text-gray-400">
                                            Nombre total de parties terminées sur cette histoire :{' '}
                                            <span className="text-white font-semibold">
                                                {pathStats.totalCompletedSessions}
                                            </span>
                                        </p>
                                        {pathStats.currentEnding && (
                                            <p className="text-gray-400">
                                                Cette fin (
                                                <span className="font-semibold">
                                                    {pathStats.currentEnding.type}
                                                </span>
                                                ) a été atteinte par{' '}
                                                <span className="text-white font-semibold">
                                                    {pathStats.currentEnding.reachedByPercentage}%
                                                </span>{' '}
                                                des joueurs.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GamePlayer;
