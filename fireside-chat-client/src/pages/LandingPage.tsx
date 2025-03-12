import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db, signInWithGoogle, auth } from "../services/firebase.ts";
import { User, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import { Timestamp } from "firebase/firestore";
import CreateChat from "../components/CreateChat.tsx";

export interface Chat {
    id: string;
    messages: Message[];
    chatName: string;
    userId: string;
    createdAt: Timestamp;
    expiresAt: Timestamp;
}

export interface Message {
    id: string;
    message: string;
    userId: string;
}

const LandingPage = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [user, setUser] = useState<User | null>(null);

    // Check the authentication state when the component mounts
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Set the user state based on the current user
        });

        // Clean up the subscription when the component unmounts
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        const user = await signInWithGoogle();
        if (user) {
            setUser(user);
        }
    };

    useEffect(() => {
        const fetchChats = async () => {
            const chatsQuery = query(
                collection(db, "chats"),
                orderBy("createdAt", "desc")
            );
            try {
                const querySnapshot = await getDocs(chatsQuery);
                const chatList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    messages: doc.data().message,
                    chatName: doc.data().chatName,
                    userId: doc.data().userid,
                    createdAt: doc.data().createdAt,
                    expiresAt: doc.data().expiresAt,
                }));
                setChats(chatList);
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
        };

        fetchChats().then(() => console.log("Chats fetched"));
    }, []);

    if (!user) {
        return (
            <button onClick={handleLogin}>Log in with Google</button>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4">Chats</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        className="border p-4 rounded-lg shadow-lg hover:shadow-xl transition"
                    >
                        <h2 className="font-bold text-xl">{chat.chatName}</h2>
                        <p className="text-sm text-gray-600">Created: {chat.createdAt.toDate().toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Expires: {chat.expiresAt.toDate().toLocaleString()}</p>
                        <Link to={`/chat/${chat.id}`}>
                            Join
                        </Link>
                    </div>
                ))}
            </div>
            <CreateChat />
        </div>
    );
};

export default LandingPage;
