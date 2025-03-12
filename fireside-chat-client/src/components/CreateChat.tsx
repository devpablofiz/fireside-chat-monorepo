import { useState } from "react";
import { createChat } from "../services/api";
import { auth } from "../services/firebase";

const CreateChat = () => {
    const [chatName, setChatName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateChat = async () => {
        if (!chatName) return alert("Chat name is required!");

        setLoading(true);
        const token = await auth.currentUser?.getIdToken();
        if (!token) return alert("Not authenticated!");

        try {
            await createChat(token, chatName);
            alert("Chat created!");
            setChatName("");
        } catch (error) {
            console.error("Chat creation error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Create a Chat</h2>
            <input
                type="text"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                placeholder="Enter chat name"
            />
            <button onClick={handleCreateChat} disabled={loading}>
                {loading ? "Creating..." : "Create Chat"}
            </button>
        </div>
    );
};

export default CreateChat;
