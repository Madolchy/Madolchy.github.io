export type ContextAction = {
    contextName: string;
    contextAction: () => void;
    isDisabled: boolean;
};
