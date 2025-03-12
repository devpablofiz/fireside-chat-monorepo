import {useCallback, useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {collection, query, orderBy, onSnapshot, doc, getDoc} from "firebase/firestore";
import {db} from "../services/firebase.ts";
import {auth} from "../services/firebase";
import {sendMessage} from "../services/api";
import {Chat} from "./LandingPage.tsx";

const ChatPage = () => {
    const {chatId} = useParams();
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<{ id: string; message: string; userId: string }[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isExpired, setExpired] = useState(false);

    useEffect(() => {
        if (!chat) {
            return;
        }
        const currentUTCTime = new Date();
        const expired = chat.expiresAt.toDate().getTime() < currentUTCTime.getTime();
        setExpired(expired);

    }, [chatId, chat]);

    // Fetch chat details and Firestore server time
    const fetchChatData = useCallback(async () => {
        if (!chatId) return;

        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            setChat({
                id: chatSnap.id,
                messages: chatData.message,
                chatName: chatData.chatName,
                userId: chatData.userid,
                createdAt: chatData.createdAt,
                expiresAt: chatData.expiresAt,
            });
        }

    }, [chatId]);

    useEffect(() => {
        if (chatId) {
            fetchChatData().then(() => console.log("fetched chats"));

            const messagesRef = collection(db, "chats", chatId, "messages");
            const q = query(messagesRef, orderBy("timestamp", "asc"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                setMessages(snapshot.docs.map((doc) => ({
                    id: doc.id,
                    message: doc.data().message,
                    userId: doc.data().userId,
                })));
            });

            return () => unsubscribe();
        }
    }, [chatId, fetchChatData]);

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
            alert("Failed to send message.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 space-y-4">
            <Link to={`/`}>Home</Link>
            <h2 className="text-3xl font-bold text-gray-900">{chat?.chatName || "Loading..."}</h2>
            <p className="text-lg text-gray-700">
                Created: {chat?.createdAt.toDate().toLocaleString()}
            </p>
            <p className="text-lg text-gray-700">
                Expires: {chat?.expiresAt.toDate().toLocaleString()}
            </p>

            <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-4 space-y-4 border">
                <ul className="space-y-2 overflow-y-auto max-h-60">
                    {messages.map((msg) => (
                        <li key={msg.id} className="p-2 rounded-lg bg-gray-100">
                            <p className="text-gray-800 font-semibold">{msg.userId}</p>
                            <p className="text-gray-600">{msg.message}</p>
                        </li>
                    ))}
                </ul>

                {!isExpired ? (
                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={loading}
                            className="px-4 py-2 rounded-md bg-blue-500 text-white font-semibold disabled:bg-gray-400 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            {loading ? "Sending..." : "Send"}
                        </button>
                    </div>
                ) : (
                    <p className="text-red-500 text-center font-semibold">
                        This chat has expired.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
