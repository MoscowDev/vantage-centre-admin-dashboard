
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { AppRouter } from './routes/AppRouter';

// Initialize TanStack React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent aggressive auto-refetching on tab focus
      retry: 1, // Only retry failed requests once
      staleTime: 5000, // Consider data fresh for 5 seconds
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
