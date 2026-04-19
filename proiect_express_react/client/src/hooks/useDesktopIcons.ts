import { useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileManagerService } from '../services/FileUploadService';
import { apiClient } from '../client/apiClient';

export function useDesktopIcons() {
    const queryClient = useQueryClient();
    const draggedBoxRef = useRef<number | undefined>(undefined);

    const { data: gridData, isLoading, isError } = useQuery({
        queryKey: ['desktopIcons'],
        queryFn: async () => await FileManagerService.getUserDesktop(),
        staleTime: Infinity,
    });

    const handleSelect = useCallback((index: number) => {
        draggedBoxRef.current = index;
    }, []);

    const handleSwap = useCallback(async (newPosition: number) => {
        const sourceIndex = draggedBoxRef.current;
        draggedBoxRef.current = undefined; // Reset immediately

        if (sourceIndex === undefined || sourceIndex === newPosition) return;

        const result = await apiClient.post('/desktop/swap', { 
            json: { first: sourceIndex, second: newPosition }
        });
        
        if (result.ok) {
            queryClient.invalidateQueries({ queryKey: ['desktopIcons'] });
        }
    }, [queryClient]);

    return { 
        gridData, 
        isLoading, 
        isError, 
        handleSelect, 
        handleSwap 
    };
}