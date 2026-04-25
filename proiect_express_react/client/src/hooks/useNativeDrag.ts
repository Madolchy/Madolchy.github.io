import { useEffect, useRef } from 'react';

export function useNativeDrag() {
    const windowRef = useRef(null);
    const handleRef = useRef(null);
    const position = useRef({ x: 300, y: 400 }); // Your default start position

    useEffect(() => {
        const win = windowRef.current;
        const handle = handleRef.current;
        if (!win || !handle) return;

        let isDragging = false;
        let startX, startY;

        // Apply initial position
        win.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;

        const onPointerDown = (e) => {
            isDragging = true;
            startX = e.clientX - position.current.x;
            startY = e.clientY - position.current.y;
            
            // Capture the pointer so dragging works even if the mouse leaves the handle slightly
            handle.setPointerCapture(e.pointerId);
            
            // Optional: You can still fire a callback here to handle z-index updates
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;
            
            // Calculate new position
            position.current.x = e.clientX - startX;
            position.current.y = e.clientY - startY;
            
            // DIRECT DOM MUTATION: Zero React lag
            win.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
        };

        const onPointerUp = (e) => {
            isDragging = false;
            handle.releasePointerCapture(e.pointerId);
        };

        handle.addEventListener('pointerdown', onPointerDown);
        handle.addEventListener('pointermove', onPointerMove);
        handle.addEventListener('pointerup', onPointerUp);

        return () => {
            handle.removeEventListener('pointerdown', onPointerDown);
            handle.removeEventListener('pointermove', onPointerMove);
            handle.removeEventListener('pointerup', onPointerUp);
        };
    }, []);

    return { windowRef, handleRef };
}