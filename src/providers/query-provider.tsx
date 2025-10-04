import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - longer cache for better performance
      gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on tab switch for better performance
      refetchOnMount: false, // Don't refetch on component mount if data exists
      placeholderData: (previousData: any) => previousData, // Keep previous data while loading new data
      notifyOnChangeProps: ["data", "error"], // Only re-render on data/error changes
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
