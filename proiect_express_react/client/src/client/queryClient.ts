import { QueryClient } from "@tanstack/react-query";
import ms from "ms";

export const queryClient = new QueryClient({
    defaultOptions: {
        // Since icons are stored by uuid which is unique, we can keep a infinite stale time for most stuff (1m here because its general)
        // and we're letting gc run after a while, so all those images don't pile up if they're not clean up automatically for some reason
        queries: {
            staleTime: ms("1m"),

            gcTime: ms("5m"),

            refetchOnWindowFocus: false,

            retry: 3,
        },
    },
});

// we clear the URL caches when gc runs.
queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "removed") {
        console.log("Hai hai haihaih iahia");
        // const { queryKey } = event.query;
        // const cachedData = event.query.state.data;

        // console.log(`🧹 Cache GC triggered for key:`, queryKey);

        // // 3. Intercept specific queries based on their key
        // if (queryKey[0] === "file") {
        // console.log(`File blob for UUID ${queryKey[1]} was just dumped from memory!`);

        // You can run any global cleanup logic here
        // (e.g., pinging a logging server, clearing out a related Zustand store, etc.)
    }
});
