import { useState, useCallback, useRef, useEffect } from 'react';
import type { vec2 } from '../types/default';




export function useContextMenu() {
    const [contextActiveId, setActiveContextId] = useState(null)
    const [contextPosition, setContextPosition] = useState<vec2>({ x: 0, y: 0 })

    const openContext = useCallback((e, id) => {
        e.preventDefault();
        e.stopPropagation();

        setContextPosition({ x: e.pageX, y: e.pageY })
        setActiveContextId((prevId) => (prevId === id ? null : id));

    }, [])

    const closeContext = useCallback(() => {
        setActiveContextId(null);
    }, []);


    useEffect(() => {
        if (contextActiveId) {
            window.addEventListener('click', closeContext);
            return () => window.removeEventListener('click', closeContext);
        }
    }, [contextActiveId, closeContext]);

    return {
        contextActiveId,
        contextPosition,
        openContext
    };
}
