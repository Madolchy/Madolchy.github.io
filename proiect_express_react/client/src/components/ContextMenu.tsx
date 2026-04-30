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
            <ul className="dropdown-menu shadow" style={style} onContextMenu={(e) => e.preventDefault()}>
                {canSetBackground && (
                    <li>
                        <button
                            className="dropdown-item"
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
                        <span className="dropdown-item text-muted">No actions available</span>
                    </li>
                )}
            </ul>
        </>
    );
}
