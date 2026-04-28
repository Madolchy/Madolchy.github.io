import React from 'react';
import { Rnd } from 'react-rnd';
import { useBlob } from '../context/BlobContext';
import { FileManagerService } from '../services/FileManagerService';
import { FileFactory } from './FileFactory';

export const SubWindow = React.memo(function SubWindow({ onDragStart, windowData, onClose, onBringToFront }) {
    const { title, zIndex, data, id } = windowData;

    const defaultPosition = React.useMemo(() => ({
        x: 300,
        y: 400,
        width: 320,
        height: 200
    }), []);

    return (
        <Rnd
            default={defaultPosition}
            bounds="window"
            dragHandleClassName="window-header"
            onDragStart={() => {
                onBringToFront(id);
                onDragStart();
            }}
            onMouseDown={() => {
                onBringToFront(id);
            }}
            style={{
                zIndex,
                top: 0,
                left: 0,
                willChange: 'transform',
                userSelect: 'none'
            }}

            // enableUserSelectHack={false}
        >
            <div className="border border-dark bg-white h-100 d-flex flex-column shadow-sm">
                <div className="window-header bg-primary text-white px-2 d-flex justify-content-between align-items-center" style={{ cursor: 'grab' }}>
                    <span className="text-truncate" style={{ fontSize: '0.9rem' }}>{title || data?.name || "Window"}</span>
                    <button
                        className="btn btn-sm btn-danger p-0 ms-2"
                        style={{ width: '20px', height: '20px', lineHeight: '1' }}
                        onClick={(e) => { e.stopPropagation(); onClose(id); }}
                    >
                        &times;
                    </button>
                </div>

                <div className="flex-grow-1 overflow-hidden bg-light">
                    <FileFactory uuid={data.id} thumbnail={data?.thumbnail} />
                </div> 
            </div>
        </Rnd>
    );
});
