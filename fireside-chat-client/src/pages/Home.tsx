import Navbar from "../components/Navbar.tsx";
import {Link} from "react-router-dom";

const Home = () => {

    return (
        <div className="">
            <Navbar />
            <div className="flex-col flex items-center justify-center p-4 text-center">
                <img src={"/campfire.gif"} alt={"campfire"} className="w-16 sm:w-32 pixelated"/>
                <span className="text-4xl sm:text-8xl font-bold mt-10"><span className={"text-amber-900"}>Fireside</span> Chats</span>
                <p className={"mt-4 text-md sm:text-lg"}>Gather around one of the <span className={"italic text-amber-900"}>Campfires</span>. Tell a story. Spark a discussion.</p>
                <p className={"text-md sm:text-lg mb-10"}>Keep talking to feed the flames before they burn out!</p>
                <Link to="/create" className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300 mb-2">
                    Start a Campfire
                </Link>
                <Link to="/join" className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300">
                    Join a Campfire
                </Link>
            </div>
        </div>
    );
}

export default Home;
