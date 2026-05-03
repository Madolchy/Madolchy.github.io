import Navbar from "../components/Navbar";
import DesktopIconManager from "../components/DesktopIconManager";

export default function Desktop() {
    return (
        <div className="flex flex-col h-screen w-full overflow-hidden">
            <Navbar />
            <DesktopIconManager />
        </div>
    )
}