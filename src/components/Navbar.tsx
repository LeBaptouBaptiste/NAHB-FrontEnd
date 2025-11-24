import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBook, FiHome, FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-gray-800 border-b border-gray-700">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-400 hover:text-indigo-300 transition">
                        <FiBook className="text-2xl" />
                        <span>NAHB</span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-white transition">
                            <FiHome />
                            <span>Home</span>
                        </Link>

                        <Link to="/library" className="flex items-center gap-2 text-gray-300 hover:text-white transition">
                            <FiBook />
                            <span>Library</span>
                        </Link>

                        {user ? (
                            <>
                                {(user.role === 'author' || user.role === 'admin') && (
                                    <Link to="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white transition">
                                        <FiUser />
                                        <span>Dashboard</span>
                                    </Link>
                                )}

                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-400">{user.username}</span>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                                    >
                                        <FiLogOut />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex gap-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-gray-300 hover:text-white transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
