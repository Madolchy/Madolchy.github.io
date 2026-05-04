import type { ContextAction } from "@/types/context";
import type { vec2 } from "@/types/default";

interface ContextMenuProps {
    isActive: boolean;
    position: vec2;
    availableContextActions: ContextAction[];
    closeContext: () => void;
}

export default function ContextMenu({ isActive, position, availableContextActions, closeContext }: ContextMenuProps) {
    if (!isActive) return null;

    const style: React.CSSProperties = {
        top: position.y,
        left: position.x,
    };

    return (
        <ul
            className="absolute shadow-xl rounded-lg border bg-card p-1 min-w-45 text-sm animate-in fade-in zoom-in-95 duration-100 z-9999"
            style={style}
            onContextMenu={(e) => e.preventDefault()}
        >
            {availableContextActions.length > 0 ? (
                availableContextActions.map(({ contextName, contextAction }) => (
                    <li key={contextName}>
                        <button
                            className="w-full text-left px-3 py-1.5 rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                contextAction();
                                closeContext();
                            }}
                        >
                            {contextName}
                        </button>
                    </li>
                ))
            ) : (
                <li>
                    <span className="block px-3 py-1.5 text-muted-foreground italic">No actions available</span>
                </li>
            )}
        </ul>
    );
}
