import Desktop from "./Desktop";
import WindowRenderer from "./WindowRenderer";
import ContextMenuRenderer from "./ContextMenuRenderer";
import { WindowManagerProvider } from "@/context/WindowManagerProvider";
import { ContextMenuProvider } from "@/context/ContextMenuProvider";
import { DesktopManagerProvider } from "@/context/DesktopManagerProvider";
import { IconSelectionProvider } from "@/context/IconSelectionContext";

export default function DesktopIconManager() {
    return (
        <WindowManagerProvider>
            <ContextMenuProvider>
                <DesktopManagerProvider>
                    <IconSelectionProvider>
                        <Desktop />
                        <WindowRenderer />
                        <ContextMenuRenderer />
                    </IconSelectionProvider>
                </DesktopManagerProvider>
            </ContextMenuProvider>
        </WindowManagerProvider>
    );
}
