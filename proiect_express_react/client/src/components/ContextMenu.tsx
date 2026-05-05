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
                availableContextActions.map(({ contextName, contextAction, isDisabled }) => (
                    <li key={contextName}>
                        <button
                            className="w-full text-left px-3 py-1.5 rounded transition-colors data-[disabled]:text-muted-foreground data-[disabled]:cursor-not-allowed hover:not-data-[disabled]:bg-accent hover:not-data-[disabled]:text-accent-foreground"
                            type="button"
                            disabled={isDisabled}
                            data-disabled={isDisabled || undefined}
                            onClick={(e) => {
                                if (isDisabled) return;
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
