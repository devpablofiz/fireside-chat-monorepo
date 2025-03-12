import { useState, useEffect } from "react";
import { sendMessage } from "../services/api";
import { auth, db } from "../services/firebase";
import { query, where, getDocs, collection } from "firebase/firestore";

const SendMessage = ({ chatName }: { chatName: string }) => {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);

    useEffect(() => {
        // Query the `chats` collection to find the `chatId` based on `chatName`
        const chatQuery = query(collection(db, "chats"), where("chatName", "==", chatName));

        const fetchChatId = async () => {
            try {
                const querySnapshot = await getDocs(chatQuery);
                if (!querySnapshot.empty) {
                    // Assuming there's only one chat document with the given name
                    const chatDoc = querySnapshot.docs[0];
                    setChatId(chatDoc.id);  // Set the `chatId` from the found document
                } else {
                    console.log("No chat found with that name: "+ chatName);
                }
            } catch (error) {
                console.error("Error fetching chatId:", error);
            }
        };

        fetchChatId();
    }, [chatName]);

    const handleSendMessage = async () => {
        if (!message) return alert("Message is required!");
        if (!chatId) return alert("Chat not found!");

        setLoading(true);
        const token = await auth.currentUser?.getIdToken();
        if (!token) return alert("Not authenticated!");

        try {
            await sendMessage(token, chatId, message);
            setMessage("");
        } catch (error) {
            console.error("Send message error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Send Message</h2>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={handleSendMessage} disabled={loading}>
                {loading ? "Sending..." : "Send"}
            </button>
        </div>
    );
};

export default SendMessage;
