import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 minutes fresh
      cacheTime: 1000 * 60 * 30,   // 30 minutes in memory
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const asyncStoragePersister = createAsyncStoragePersister({ storage: AsyncStorage });
      persistQueryClient({
        queryClient,
        persister: asyncStoragePersister,
      }).catch((error) => {
        console.warn('Failed to restore persisted query client:', error);
      });
    }
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
