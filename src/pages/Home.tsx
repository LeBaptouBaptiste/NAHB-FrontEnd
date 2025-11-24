import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBook, FiArrowRight } from 'react-icons/fi';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto mt-16 text-center">
            <div className="mb-12">
                <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                    Welcome to NAHB
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                    Not Another Hero's Book - Create and explore interactive stories
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-indigo-500 transition">
                    <FiBook className="text-5xl text-indigo-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-3">Read Stories</h3>
                    <p className="text-gray-400 mb-6">
                        Explore interactive adventures and make choices that matter
                    </p>
                    <Link
                        to="/library"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                    >
                        <span>Browse Library</span>
                        <FiArrowRight />
                    </Link>
                </div>

                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition">
                    <FiBook className="text-5xl text-purple-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-3">Create Stories</h3>
                    <p className="text-gray-400 mb-6">
                        Craft branching narratives with multiple endings
                    </p>
                    {user ? (
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                        >
                            <span>Go to Dashboard</span>
                            <FiArrowRight />
                        </Link>
                    ) : (
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                        >
                            <span>Get Started</span>
                            <FiArrowRight />
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-4">Features</h3>
                <ul className="grid md:grid-cols-3 gap-4 text-left">
                    <li className="text-gray-300">✨ Interactive storytelling</li>
                    <li className="text-gray-300">📖 Multiple endings</li>
                    <li className="text-gray-300">🎨 Rich media support</li>
                    <li className="text-gray-300">💾 Save your progress</li>
                    <li className="text-gray-300">📊 Track statistics</li>
                    <li className="text-gray-300">🎲 Dice-based choices</li>
                </ul>
            </div>
        </div>
    );
};

export default Home;
