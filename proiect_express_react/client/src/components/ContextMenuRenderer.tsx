import { useContextMenu } from "@/context/ContextMenuContext";
import ContextMenu from "./ContextMenu";

export default function ContextMenuRenderer() {
    const { contextActiveId, contextPosition, availableContextActions, closeContext } = useContextMenu();

    return (
        <ContextMenu
            isActive={contextActiveId !== null}
            position={contextPosition}
            availableContextActions={availableContextActions}
            closeContext={closeContext}
        />
    );
}
