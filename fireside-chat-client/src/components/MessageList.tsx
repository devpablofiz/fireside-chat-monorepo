import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase.ts";

// Define a message type to ensure correct structure
interface Message {
    id: string;
    message: string;
    timestamp: any;  // Use the appropriate type for Firestore timestamp
}

const MessageList = ({ chatName }: { chatName: string }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatId, setChatId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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
                    setError(null);
                } else {
                    console.error("No chat found with that name: ", chatName);
                    setError("No chat found with that name.");
                }
            } catch (error) {
                console.error("Error fetching chatId:", error);
                setError("Error fetching chat data.");
            }
        };

        fetchChatId();
    }, [chatName]);

    useEffect(() => {
        if (chatId) {
            // Once chatId is available, query the `messages` subcollection
            const messagesRef = collection(db, "chats", chatId, "messages");
            const q = query(messagesRef, orderBy("timestamp", "asc"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message)));
            });

            return () => unsubscribe();
        }
    }, [chatId]);

    return (
        <div>
            <h2>Messages</h2>
            {error && <p>{error}</p>} {/* Display error if any */}
            <ul>
                {messages.map((msg) => (
                    <li key={msg.id}>{msg.message}</li>
                ))}
            </ul>
        </div>
    );
};

export default MessageList;
