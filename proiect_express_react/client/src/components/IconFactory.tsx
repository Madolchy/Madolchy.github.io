import { EmptyIcon, PictureSVG, TxtSvg } from "../assets/svgs";

const typeToIcon: Record<string, React.ComponentType> = {
    "text/plain": TxtSvg,
    "image/png": PictureSVG,
    "image/jpeg": PictureSVG,
    default: EmptyIcon,
};

export const FileIconFactory = ({ fileType, ...props }: { fileType: string }) => {
    const IconComponent = typeToIcon[fileType || ""] || typeToIcon["default"];

    return <IconComponent props={...props} />;
};
