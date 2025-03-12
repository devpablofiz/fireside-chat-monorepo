import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import './index.css';

function App() {


    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/chat/:chatId" element={<ChatPage />} />
            </Routes>
        </Router>
    );
}

export default App;
