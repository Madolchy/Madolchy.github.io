import type { vec2 } from "../types/default";

interface ContextMenuProps {
    isActive: boolean;
    position: vec2
}

export default function ContextMenu({ isActive, position } : ContextMenuProps) {
    if (!isActive) return null;

    const style = {
        position: 'absolute',
        display: 'block', 
        top:`${position.y}px`,
        left:`${position.x}px`,
        zIndex: 9999,   
        minWidth: '150px'
    };

    return (
        <>
            <ul className="dropdown-menu shadow" style={style}>
                <li><button className="dropdown-item" type="button">Action</button></li>
                <li><button className="dropdown-item" type="button">Another action</button></li>
                <li><button className="dropdown-item" type="button">Something else here</button></li>
            </ul>

        </>
    )
}