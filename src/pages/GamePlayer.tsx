import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { pageService } from '../api/services';
import DiceRoller from '../components/DiceRoller';

interface GameSession {
    _id: string;
    userId: string;
    storyId: string;
    currentPageId: string;
    history: string[];
    status: string;
}

interface Page {
    _id: string;
    storyId: string;
    content: string;
    image?: string;
    choices: {
        text: string;
        targetPageId: string;
    }[];
    isEnding: boolean;
    endingType?: string;
}

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
    const [diceConfig, setDiceConfig] = useState<{ difficulty: number; type: 'combat' | 'flee' } | null>(null);

    useEffect(() => {
        if (sessionId) {
            loadSession();
        }
    }, [sessionId]);

    const loadSession = async () => {
        try {
            setLoading(true);
            const sessionResponse = await api.get<GameSession>(`/game/session/${sessionId}`);
            setSession(sessionResponse.data);

            const pageResponse = await pageService.getPage(sessionResponse.data.currentPageId);
            setCurrentPage(pageResponse);
        } catch (error) {
            console.error('Failed to load session:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassSelection = (className: string) => {
        setPlayerClass(CLASSES[className]);
    };

    const handleChoice = async (choiceIndex: number, choiceText: string) => {
        if (!session || !currentPage) return;

        // Check if this is a dice roll choice (but not an outcome choice like "≥18")
        const isOutcomeChoice = choiceText.match(/^[\[<≥\d]/); // Starts with [, <, ≥, or digit
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

    const makeChoice = async (choiceIndex: number) => {
        if (!session || !currentPage) return;

        try {
            // Check if choice grants items or buffs
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

            const response = await api.post<GameSession>('/game/choice', {
                sessionId: session._id,
                choiceIndex
            });

            setSession(response.data);

            const pageResponse = await pageService.getPage(response.data.currentPageId);
            setCurrentPage(pageResponse);
        } catch (error) {
            console.error('Failed to make choice:', error);
        }
    };

    const handleRestart = async () => {
        if (!session) return;

        try {
            const response = await api.post<GameSession>('/game/start', {
                storyId: session.storyId
            });
            navigate(`/play/${response.data._id}`);
        } catch (error) {
            console.error('Failed to restart:', error);
        }
    };

    const handleBackToLibrary = () => {
        navigate('/library');
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
                        <div className="rounded-lg overflow-hidden border border-gray-700 sticky top-6">
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
                        <div className="prose prose-invert max-w-none">
                            {currentPage.content.split('\n').map((paragraph, index) => (
                                <p key={index} className="text-gray-300 mb-3 whitespace-pre-wrap">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Dice Roller (in right column below content) */}
                    {showDiceRoll && diceConfig && playerClass && (
                        <DiceRoller
                            difficulty={diceConfig.difficulty}
                            bonus={diceConfig.type === 'combat'
                                ? playerClass.combatBonus + statBuffs.combat
                                : playerClass.fleeBonus + statBuffs.flee}
                            bonusLabel={diceConfig.type === 'combat' ? 'Combat' : 'Fuite'}
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
                                    const isOutcomeChoice = choice.text.match(/^\[?[<≥\d]/); // Starts with [, <, ≥, or digit
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
                                    let displayText = choice.text
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GamePlayer;