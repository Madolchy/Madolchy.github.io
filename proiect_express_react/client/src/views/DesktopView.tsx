import Navbar from "../components/Navbar";
import DesktopIconManager from "../components/DesktopIconManager";

export default function Desktop() {
    return (
        <div className="d-flex flex-column vh-100 w-100 overflow-hidden">
            <Navbar />
            <DesktopIconManager />
        </div>
    )
}