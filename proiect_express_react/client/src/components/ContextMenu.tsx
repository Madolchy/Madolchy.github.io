import { useMemo } from "react";
import type { ContextAction } from "@/types/context";
import type { vec2 } from "@/types/default";
import { useContextBuilder } from "@/hooks/useContextBuilder";

interface ContextMenuProps {
    isActive: boolean;
    position: vec2;
    availableContextActions: ContextAction[];
}

export default function ContextMenu({ isActive, position, availableContextActions }: ContextMenuProps) {
    const items = useMemo(() => {
        const menu = useContextBuilder();
        availableContextActions.forEach(({ contextName, contextAction }) => {
            menu.addItem(contextName, contextAction);
        });

        return menu.build();
    }, [availableContextActions]);

    if (!isActive) return null;

    const style: React.CSSProperties = {
        position: "absolute",
        display: "block",
        top: position.y,
        left: position.x,
        zIndex: 9999,
    };

    return (
        <ul
            className="shadow-xl rounded-lg border bg-card p-1 min-w-[180px] text-sm animate-in fade-in zoom-in-95 duration-100"
            style={style}
            onContextMenu={(e) => e.preventDefault()}
        >
            {items.length > 0 ? (
                items.map((item) => (
                    <li key={item.key}>
                        <button
                            className="w-full text-left px-3 py-1.5 rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                item.action();
                            }}
                        >
                            {item.label}
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
