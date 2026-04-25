import { EmptyIcon, PictureSVG } from "../assets/svgs";

const typeToIcon: Record<string, React.ComponentType> = {
    'image/png': PictureSVG,
    'image/jpeg': PictureSVG,
    'default': EmptyIcon 
};

export const FileIconFactory = ({fileType}: {fileType: string}) => {
    const IconComponent = typeToIcon[fileType || ''] || typeToIcon['default'];
    
    return <IconComponent />;
};