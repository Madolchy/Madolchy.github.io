import type { ReactElement } from "react";
import type { vec2 } from "../types/default";
import type { ContextAction } from "../types/context";

class ContextMenuBuilder {
    private items: { key: string; label: string; action: () => void }[] = [];

    addItem(label: string, handler: () => void): this {
        const key = label.toLowerCase().replace(/\s+/g, "-");
        this.items.push({ key, label, action: handler });
        return this;
    }

    withActions(actions: ContextAction[]): this {
        actions.forEach(({ contextName, contextAction }) => this.addItem(contextName, contextAction));
        return this;
    }

    withBackground(handler: () => void): this {
        this.items.push({ key: "set-background", label: "Set as background", action: handler });
        return this;
    }

    withMakeFolder(handler: () => void): this {
        this.items.push({ key: "make-folder", label: "Create folder", action: handler });
        return this;
    }

    withDelete(handler: () => void): this {
        this.items.push({ key: "delete", label: "Delete", action: handler });
        return this;
    }

    build(position: vec2, zIndex = 9999): ReactElement {
        return (
            <ul
                className="shadow-xl rounded-lg border bg-card p-1 min-w-[180px] text-sm animate-in fade-in zoom-in-95 duration-100"
                style={{ position: "absolute", top: position.y, left: position.x, zIndex }}
                onContextMenu={(e) => e.preventDefault()}
            >
                {this.items.length > 0 ? (
                    this.items.map(({ key, label, action }) => (
                        <li key={key}>
                            <button
                                className="w-full text-left px-3 py-1.5 rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    action();
                                }}
                            >
                                {label}
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
}

export function ContextBuilder(): ContextMenuBuilder {
    return new ContextMenuBuilder();
}

export type { ContextAction };
