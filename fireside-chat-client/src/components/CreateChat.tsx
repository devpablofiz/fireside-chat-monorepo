import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createChat } from "../services/api";
import { auth } from "../services/firebase";

const CreateChat = () => {
    const [chatName, setChatName] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreateChat = useCallback(async () => {
        if (!chatName) return;

        setLoading(true);
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        try {
            const res = await createChat(token, chatName);
            setChatName("");
            if (res) {
                navigate("/chat/"+res.chatId);
            }
        } catch (error) {
            console.error("Chat creation error:", error);
        } finally {
            setLoading(false);
        }
    }, [chatName, navigate]);

    return (
        <div className="mt-10 p-6 min-w-64 bg-white rounded-lg shadow-md flex flex-col justify-center items-center">
            <img src={"/campfire.gif"} alt={"campfire"} className="w-12 sm:w-16 pixelated mb-2 "/>
            <h2 className="text-xl font-semibold mb-4 text-center">Start a Campfire</h2>
            <input
                type="text"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                placeholder="Enter campfire name"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
                onClick={handleCreateChat}
                disabled={loading}
                className="mt-4 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
                {loading ? "Creating..." : "Start"}
            </button>
        </div>
    );
};

export default CreateChat;
