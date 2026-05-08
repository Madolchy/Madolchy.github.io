import { EmptyIcon, Picture, TxtSvg } from "../assets/svgs";

export const FileIconFactory = ({ fileType, ...props }: { fileType: string; [key: string]: unknown }) => {
    const typeToIcon: Record<string, React.ComponentType<Record<string, unknown>>> = {
        "text/plain": TxtSvg,
        "image/png": Picture,
        "image/jpeg": Picture,
        default: EmptyIcon,
    };

    const IconComponent = typeToIcon[fileType || ""] || typeToIcon["default"];

    return <IconComponent {...props} />;
};
