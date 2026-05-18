import Desktop from "./Desktop";
import WindowRenderer from "./WindowRenderer";
import ContextMenuRenderer from "./ContextMenuRenderer";
import { WindowManagerProvider } from "@/context/WindowManagerProvider";
import { ContextMenuProvider } from "@/context/ContextMenuProvider";
import { DesktopManagerProvider } from "@/context/DesktopManagerProvider";

export default function DesktopIconManager() {
    return (
        <WindowManagerProvider>
            <ContextMenuProvider>
                <DesktopManagerProvider>
                    <Desktop />
                    <WindowRenderer />
                    <ContextMenuRenderer />
                </DesktopManagerProvider>
            </ContextMenuProvider>
        </WindowManagerProvider>
    );
}
