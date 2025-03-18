import {useState} from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../context/AuthProvider.tsx";
import LoginModal from "./Login.tsx";
import OfflineBanner from "./OfflineBanner.tsx"; // Import the modal

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const {user, logout} = useAuth();

    return (
        <div>
            <OfflineBanner/>
            <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <div className="flex flex-row items-end">
                    <Link className="ml-2 text-xl sm:text-2xl font-bold" to={"/"}>Fireside Chats</Link>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="bg-gray-700 px-4 py-2 rounded-md focus:outline-none"
                    >
                        Menu
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg">
                            <Link to="/" className="block px-4 py-2 hover:bg-gray-200"
                                  onClick={() => setIsDropdownOpen(false)}>
                                Home
                            </Link>
                            <Link to="/create" className="block px-4 py-2 hover:bg-gray-200"
                                  onClick={() => setIsDropdownOpen(false)}>
                                Start a Campfire
                            </Link>
                            <Link to="/join" className="block px-4 py-2 hover:bg-gray-200"
                                  onClick={() => setIsDropdownOpen(false)}>
                                Join a Campfire
                            </Link>
                            <hr className="border-gray-300"/>
                            {user ? (
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsLoginModalOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-200"
                                >
                                    Log out
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsLoginModalOpen(true);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-200"
                                >
                                    Log in
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* Render the Login Modal if open */}
            {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)}/>}
        </div>
    );
};

export default Navbar;
