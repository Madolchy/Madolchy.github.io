import { AudioSvg, EmptyIcon, FolderSvg, Picture, TxtSvg } from "../assets/svgs";

export const FileIconFactory = ({ type, ...props }: { type: string; [key: string]: unknown }) => {
    const typeToIcon: Record<string, React.ComponentType<Record<string, unknown>>> = {
        "text/plain": TxtSvg,
        "type/folder": FolderSvg,
        "audio/mpeg": AudioSvg,
        "image/png": Picture,
        "image/jpeg": Picture,
        default: EmptyIcon,
    };

    const IconComponent = typeToIcon[type || ""] || typeToIcon["default"];

    return <IconComponent {...props} />;
};
