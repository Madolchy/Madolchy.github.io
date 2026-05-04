export type ContextMenuItem = {
    key: string;
    label: string;
    action: () => void;
};

class ContextMenuBuilder {
    private items: ContextMenuItem[] = [];

    addItem(label: string, handler: () => void): this {
        const key = label.toLowerCase().replace(/\s+/g, "-");
        this.items.push({ key, label, action: handler });
        return this;
    }

    withBackground(name: string, handler: () => void): this {
        this.items.push({ key: "set-background", label: "Set as background", action: handler });
        return this;
    }

    withMakeFolder(name: string, handler: () => void): this {
        this.items.push({ key: "make-folder", label: "Create folder", action: handler });
        return this;
    }

    withDelete(name: string, handler: () => void): this {
        this.items.push({ key: "delete", label: "Delete", action: handler });
        return this;
    }

    build(): ContextMenuItem[] {
        return this.items;
    }
}

export function useContextBuilder(): ContextMenuBuilder {
    return new ContextMenuBuilder();
}
