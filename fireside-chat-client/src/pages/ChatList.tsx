import {useEffect, useState} from "react";
import {collection, query, orderBy, getDocs} from "firebase/firestore";
import {db} from "../services/firebase.ts";
import {Link} from "react-router-dom";
import {Timestamp} from "firebase/firestore";
import Navbar from "../components/Navbar.tsx";
import {formatDistanceToNow} from "date-fns";
import {useAuth} from "../context/AuthProvider.tsx";
import Login from "../components/Login.tsx";

export interface Chat {
    id: string;
    messages: Message[];
    chatName: string;
    userId: string;
    createdAt: Timestamp;
    expiresAt: Timestamp;
    expired: boolean;
}

export interface Message {
    id: string;
    message: string;
    userId: string;
}

const ChatList = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const {user} = useAuth();

    useEffect(() => {

        if (!user) {
            return;
        }

        const fetchChats = async () => {
            const chatsQuery = query(
                collection(db, "chats"),
                orderBy("createdAt", "desc")
            );
            try {
                const querySnapshot = await getDocs(chatsQuery);
                const chatList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    messages: doc.data().messages,
                    chatName: doc.data().chatName,
                    userId: doc.data().userId,
                    createdAt: doc.data().createdAt,
                    expiresAt: doc.data().expiresAt,
                    expired: doc.data().expiresAt.toDate().getTime() < new Date().getTime()
                }));
                setChats(chatList);
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
        };

        fetchChats().then(() => console.log("Chats fetched"));
    }, [user]);

    return (
        <div>
            <Navbar/>
            {!user && (<Login/>)}
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-4 ">
                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        className="text-center min-w-24 min-h-40 border p-4 rounded-lg shadow-lg hover:shadow-xl transition flex-col"
                    >
                        <span className="font-bold text-xl text-amber-900">Campfire "{chat.chatName}"</span>
                        <p className="italic text-xs mb-2">Lit by {chat.userId}</p>
                        <p className="text-sm text-gray-600">Lit {formatDistanceToNow(chat.createdAt.toDate(), {addSuffix: true})}</p>
                        {chat.expired ?
                            (<p className="text-sm text-red-600">Burned out!</p>) :
                            (
                                <p className="italic text-sm text-gray-600">Burns
                                    out {formatDistanceToNow(chat.expiresAt.toDate(), {addSuffix: true})}</p>)
                        }
                        {!chat.expired ? (
                            <Link to={`/chat/${chat.id}`} className={"flex items-center justify-center"}>
                                <button className={"mt-2 px-1.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600"}>
                                    Join!
                                </button>
                            </Link>
                        ) : (
                            <span className={"flex items-center justify-center"}>
                                <button disabled className={"mt-2 px-1.5 py-1 rounded-md bg-gray-300"}>
                                    Ended
                                </button>
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
        ;
};

export default ChatList;
