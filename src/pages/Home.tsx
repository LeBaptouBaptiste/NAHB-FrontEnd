import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBook, FiArrowRight, FiEdit3 } from 'react-icons/fi';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto mt-16 text-center px-6">
            <div className="mb-12">
                <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                    Welcome to NAHB
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                    Not Another Hero's Book - Create and explore interactive stories
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-8 rounded-xl border-2 border-emerald-500/40 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer group">
                    <FiBook className="text-5xl text-emerald-600 dark:text-emerald-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold mb-3">Read Stories</h3>
                    <p className="text-muted-foreground mb-6">
                        Explore interactive adventures and make choices that matter
                    </p>
                    <Link
                        to="/library"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl cursor-pointer"
                    >
                        <span>Browse Library</span>
                        <FiArrowRight />
                    </Link>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-8 rounded-xl border-2 border-green-500/40 hover:border-green-500 hover:shadow-xl transition-all cursor-pointer group">
                    <FiEdit3 className="text-5xl text-green-600 dark:text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold mb-3">Create Stories</h3>
                    <p className="text-muted-foreground mb-6">
                        Craft branching narratives with multiple endings
                    </p>
                    {user ? (
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl cursor-pointer"
                        >
                            <span>Go to Dashboard</span>
                            <FiArrowRight />
                        </Link>
                    ) : (
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl cursor-pointer"
                        >
                            <span>Get Started</span>
                            <FiArrowRight />
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-card border border-border/50 hover:border-border p-8 rounded-xl shadow-sm hover:shadow-md transition-all">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Features</h3>
                <ul className="grid md:grid-cols-3 gap-4 text-left">
                    <li className="flex items-center gap-2 text-foreground">
                        <span className="text-emerald-500">✨</span>
                        <span>Interactive storytelling</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                        <span className="text-emerald-500">📖</span>
                        <span>Multiple endings</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                        <span className="text-emerald-500">🎨</span>
                        <span>Rich media support</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                        <span className="text-emerald-500">💾</span>
                        <span>Save your progress</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                        <span className="text-emerald-500">📊</span>
                        <span>Track statistics</span>
                    </li>
                    <li className="flex items-center gap-2 text-foreground">
                        <span className="text-emerald-500">🎲</span>
                        <span>Dice-based choices</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Home;
