import React from 'react';
import './DesktopIcon.css'
import { FileType } from "../services/DesktopIconService";

const SquareSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-app" viewBox="0 0 16 16">
        <path d="M11 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zM5 1a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4z" />
    </svg>
);

const PictureSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-image" viewBox="0 0 16 16">
        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
        <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z" />
    </svg>
);

const EmptyIcon = () => null;

const typeToIcon: Record<string, React.ComponentType> = {
    'image/png': PictureSVG,
    'image/jpeg': PictureSVG,
    'default': SquareSVG
};

const DesktopIcon = React.memo(({ id, data, onMouseUpCallback, onMouseDownCallback, handleDrop, handleDragOver }: any) => {
    const IconComponent = typeToIcon[data?.type] || EmptyIcon

    return (
        <div
            id={`icon-${id}`}
            className="position-relative text-black bg-transparent d-flex align-items-center justify-content-center"
            // 1. Tell the browser this element isn't for native dragging
            draggable={false}
            style={{
                userSelect: 'none',
                // 2. Helps the browser understand this is a custom interaction
                touchAction: 'none',
                cursor: data ? 'grab' : 'default'
            }}
            onMouseDown={() => onMouseDownCallback(id)}
            onMouseUp={() => onMouseUpCallback(id)}
            // 3. Keep this as a backup for older browsers
            onDragStart={(e) => e.preventDefault()}
            
            onDrop={(e) => handleDrop(e, id)}
            onDragOver={(e) => handleDragOver(e)}
        >
            {id == 20 && <div className="icon-highlight" />}
            <div style={{ pointerEvents: 'none', position: 'relative', zIndex: 2 }}>
                <IconComponent />
            </div>
        </div>
    );
});
export default DesktopIcon;