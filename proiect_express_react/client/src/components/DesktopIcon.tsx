import React, { useEffect } from 'react';
import './DesktopIcon.css'
import { FileIconFactory } from './IconFactory';
import { useBlob } from '../context/BlobContext';


const DesktopIcon = React.memo(({ id, data, isActive, onMouseUpCallback, onMouseDownCallback, onCellDrop, onDoubleClick }: any) => {
    const { getUrl } = useBlob();

    const imgUrl = (() => {
        if (!data?.thumbnail || !data?.id) return null;
        return getUrl(data.id, data.thumbnail);
    })();

    return (
        <div
            id={`icon-${id}`}
            className="position-relative text-black bg-transparent d-flex align-items-center justify-content-center"
            draggable={false}
            onMouseDown={() => onMouseDownCallback(id)}
            onMouseUp={() => onMouseUpCallback(id)}

            onDragStart={(e) => e.preventDefault()}
            onDrop={(e) => onCellDrop(e, id)}
            onDragOver={(e) => e.preventDefault()}

            onDoubleClick={(e) => { e.stopPropagation(); if (onDoubleClick) onDoubleClick(id, data); }}
        >
            <div className={`icon icon-grabbable d-flex align-items-center justify-content-center position-relative pe-none ${isActive ? 'icon-highlight' : ''}`} style={{ zIndex: 2 }}>
                {imgUrl ? (
                    <img
                        src={imgUrl}
                        draggable={false}
                        className="w-100 h-100 object-fit-contain pe-none user-select-none native-drag-none"
                    />
                ) : (
                    <FileIconFactory fileType={data?.file_type} />
                )}
            </div>
        </div >
    );
});
export default DesktopIcon;