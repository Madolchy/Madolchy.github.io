import { useContextMenu } from "@/context/ContextMenuContext";
import ContextMenu from "./ContextMenu";
import { useContextMenuStore } from "@/store/contextMenuStore";

export default function ContextMenuRenderer() {
    const activeId = useContextMenuStore((s) => s.activeId);
    const position = useContextMenuStore((s) => s.position);
    const actions = useContextMenuStore((s) => s.actions);
    const closeContext = useContextMenuStore((s) => s.closeContext);

    return <ContextMenu isActive={activeId !== null} position={position} availableContextActions={actions} closeContext={closeContext} />;
}
