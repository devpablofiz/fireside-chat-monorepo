import {useCallback, useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {collection, query, orderBy, onSnapshot, doc, getDoc} from "firebase/firestore";
import {db} from "../services/firebase.ts";
import {auth} from "../services/firebase";
import {sendMessage} from "../services/api";
import {Chat, Message} from "./ChatList.tsx";
import Navbar from "../components/Navbar.tsx";
import {formatDistanceToNow} from "date-fns";

import {useAuth} from "../context/AuthProvider.tsx";
import Login from "../components/Login.tsx";

const ChatPage = () => {
    const {chatId} = useParams();
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isExpired, setExpired] = useState(false);
    const navigate = useNavigate();
    const {user} = useAuth();

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
        try {
            const chatRef = doc(db, "chats", chatId);
            const chatSnap = await getDoc(chatRef);

            if (chatSnap.exists()) {
                const chatData = chatSnap.data();
                setChat({
                    id: chatSnap.id,
                    messages: chatData.message,
                    chatName: chatData.chatName,
                    userId: chatData.userId,
                    createdAt: chatData.createdAt,
                    expiresAt: chatData.expiresAt,
                    expired: isExpired
                });
            }
        } catch (error) {
            console.log(error);
        }
    }, [chatId, isExpired]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messagesEndRef]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }
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

            const interval = setInterval(fetchChatData, 5000);

            return () => {
                unsubscribe();
                clearInterval(interval);
            };
        }
    }, [chatId, fetchChatData, scrollToBottom, user]);

    const handleSendMessage = async () => {
        if (!message) return;
        if (!chatId) return;

        setLoading(true);
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        try {
            await sendMessage(token, chatId, message);
            setMessage("");
        } catch (error) {
            console.error("Send message error:", error);
        } finally {
            setLoading(false);
            fetchChatData().then(() => console.log("fetched chats"));
        }
    };

    if (!chat) {
        return (
            <div>
                <Navbar/>
            </div>
        );
    }

    if (!user) {
        navigate("/");
        return;
    }

    return (
        <div>
            {!user && (<Login/>)}
            <Navbar/>
            <div className="flex flex-col items-center px-6">
                <img src={"/campfire.gif"} alt={"campfire"} className="w-12 sm:w-16 pixelated mb-2"/>
                <h2 className="text-4xl font-bold text-amber-900">Campfire "{chat.chatName}"</h2>
                <h2 className="text-lg italic text-gray-900">Lit by {chat.userId}</h2>
                <p className="text-lg text-gray-700 mt-2">
                    Lit {formatDistanceToNow(chat.createdAt.toDate(), {addSuffix: true})}
                </p>
                {!isExpired ? (<p className="italic text-lg text-gray-700">
                        Burns out {formatDistanceToNow(chat.expiresAt.toDate(), {addSuffix: true})}
                    </p>
                ) : (<p className="italic text-lg text-gray-700">
                    Burned out {formatDistanceToNow(chat.expiresAt.toDate(), {addSuffix: true})}
                </p>)}

                <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-4 border mt-5">
                    {!isExpired && (
                        <ul className="space-y-2 overflow-y-auto h-64 sm:h-96 mb-2">
                            {messages.map((msg) => {
                                const isCurrentUser = msg.userId === auth.currentUser?.displayName;
                                return (
                                    <li
                                        key={msg.id}
                                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`min-w-32 max-w-96 p-2 rounded-lg ${
                                                isCurrentUser ? "bg-cyan-100 text-right" : "bg-green-200 text-left"
                                            }`}
                                        >
                                            <p className="text-gray-800 font-semibold">{msg.userId}</p>
                                            <p className="text-gray-600">{msg.message}</p>
                                        </div>
                                    </li>
                                );
                            })}
                            <div ref={messagesEndRef}></div>
                        </ul>
                    )}

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
                            The flames have burned out, sent messages are no longer available.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
