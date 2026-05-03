import type { vec2 } from "../types/default";

interface ContextMenuProps {
    isActive: boolean;
    position: vec2;
    canSetBackground?: boolean;
    onSetBackground?: () => void;
    isBackgroundSetting?: boolean;
}

export default function ContextMenu({
    isActive,
    position,
    canSetBackground,
    onSetBackground,
    isBackgroundSetting,
}: ContextMenuProps) {
    if (!isActive) return null;

    const style = {
        position: "absolute",
        display: "block",
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 9999,
        minWidth: "150px",
    };

    return (
        <>
            <ul className="shadow rounded-lg border bg-card p-1 min-w-[150px] text-sm" style={style} onContextMenu={(e) => e.preventDefault()}>
                {canSetBackground && (
                    <li>
                        <button
                            className="w-full text-left px-3 py-1.5 rounded hover:bg-muted"
                            type="button"
                            onClick={onSetBackground}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            Set as background
                        </button>
                    </li>
                )}
                {!canSetBackground && (
                    <li>
                        <span className="block px-3 py-1.5 text-muted-foreground">No actions available</span>
                    </li>
                )}
            </ul>
        </>
    );
}
