import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import './index.css';
import Home from "./pages/Home.tsx";
import ChatList from "./pages/ChatList.tsx";
import ChatCreation from "./pages/ChatCreation.tsx";
import {AuthProvider} from "./context/AuthProvider.tsx";

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/join" element={<ChatList/>}/>
                    <Route path="/create" element={<ChatCreation/>}/>
                    <Route path="/chat/:chatId" element={<ChatPage/>}/>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
