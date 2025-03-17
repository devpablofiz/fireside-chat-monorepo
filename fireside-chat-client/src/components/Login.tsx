import {useState} from "react";
import {signInWithGoogle} from "../services/firebase.ts";
import {useNavigate} from "react-router-dom";

const Login = ({onClose = () => null}: { onClose?: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        try {
            const user = await signInWithGoogle();
            if (user) {
                console.log("Logged in as", user.displayName);
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Login failed", error);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsOpen(false); // Close the modal when clicked outside or on close button
        onClose();
        navigate("/");
    };

    return (
        <>
            {/* Overlay to dim the background */}
            {isOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs w-full">
                        <h1 className="text-lg sm:text-2xl font-bold mb-4 text-center">Sign in to continue</h1>
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="text-sm sm:text-lg w-full flex items-center justify-center px-2 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition disabled:bg-gray-400"
                        >
                            {loading ? "Signing in..." : "Sign in with Google"}
                        </button>
                        <button
                            onClick={closeModal}
                            className="text-sm sm:text-lg mt-4 w-full text-center text-gray-500 hover:text-gray-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;
