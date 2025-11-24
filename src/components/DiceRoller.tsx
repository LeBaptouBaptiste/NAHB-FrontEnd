import { useState } from 'react';

interface DiceRollerProps {
    difficulty: number;
    bonus: number;
    bonusLabel: string;
    onResult: (success: boolean, roll: number, total: number) => void;
}

const DiceRoller = ({ difficulty, bonus, bonusLabel, onResult }: DiceRollerProps) => {
    const [rolling, setRolling] = useState(false);
    const [result, setResult] = useState<{ roll: number; total: number; success: boolean } | null>(null);

    const rollDice = () => {
        setRolling(true);
        setResult(null);

        // Simulate dice rolling animation
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 20) + 1; // 1d20
            const total = roll + bonus;
            const success = total >= difficulty;

            setResult({ roll, total, success });
            setRolling(false);
            onResult(success, roll, total);
        }, 1500); // 1.5s animation
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 my-4">
            <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">🎲 Lancé de Dé Required</h3>
                <p className="text-gray-400 mb-4">
                    Difficulté: <span className="text-yellow-400 font-bold">{difficulty}</span>
                </p>

                <div className="mb-4">
                    {rolling && (
                        <div className="text-6xl animate-bounce">
                            🎲
                        </div>
                    )}

                    {result && (
                        <div className="space-y-2">
                            <div className="text-5xl font-bold text-white">
                                {result.roll}
                            </div>
                            <div className="text-sm text-gray-400">
                                {result.roll} (dé) {bonus >= 0 ? '+' : ''}{bonus} ({bonusLabel}) = <span className="font-bold text-white">{result.total}</span>
                            </div>
                            <div className={`text-2xl font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                                {result.success ? '✅ SUCCÈS!' : '❌ ÉCHEC'}
                            </div>
                        </div>
                    )}

                    {!rolling && !result && (
                        <div className="text-4xl text-gray-600">
                            🎲
                        </div>
                    )}
                </div>

                {!result && (
                    <button
                        onClick={rollDice}
                        disabled={rolling}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-bold transition-colors text-lg"
                    >
                        {rolling ? 'Lancement...' : 'Lancer le Dé'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default DiceRoller;
