import { useWindowManager } from "@/context/WindowManagerContext";
import { SubWindow } from "./SubWindow";

export default function WindowRenderer() {
    const { windows, closeWindow, bringToFront } = useWindowManager();

    return (
        <>
            {windows.map((win) => (
                <SubWindow
                    key={win.id}
                    windowData={win}
                    onClose={closeWindow}
                    onDragStart={() => {}}
                    onBringToFront={bringToFront}
                />
            ))}
        </>
    );
}
