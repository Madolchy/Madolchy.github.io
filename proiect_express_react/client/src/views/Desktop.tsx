import Navbar from "../components/Navbar";
import DesktopGrid from "../components/DesktopGrid";
import DragDropZone from "../components/DragDropZone";

export default function Desktop() {
    return (
        <div className="d-flex flex-column vh-100 w-100 overflow-hidden">
            <Navbar />
            <DragDropZone>
                <DesktopGrid />
            </DragDropZone>
        </div>
    )
}