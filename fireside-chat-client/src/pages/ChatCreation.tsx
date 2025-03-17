import Navbar from "../components/Navbar.tsx";
import CreateChat from "../components/CreateChat.tsx";
import { useAuth } from "../context/AuthProvider.tsx"; // Assuming the AuthContext is in context/AuthContext.tsx
import Login from "../components/Login.tsx";

const ChatCreation = () => {
    const { user } = useAuth();

    return (
        <div className="">
            <Navbar />
            {!user && (<Login />)}
            <div className="flex-col flex items-center justify-center">
                <CreateChat />
            </div>
        </div>
    );
};

export default ChatCreation;
