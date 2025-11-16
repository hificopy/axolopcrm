import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

// Try importing pieces one at a time to find the error
console.log('1. Starting imports...');

try {
  console.log('2. Importing BrowserRouter...');
  const { BrowserRouter } = await import('react-router-dom');

  console.log('3. Importing QueryClient...');
  const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');

  console.log('4. Importing HelmetProvider...');
  const { HelmetProvider } = await import('react-helmet-async');

  console.log('5. Importing SupabaseProvider...');
  const { SupabaseProvider } = await import('./context/SupabaseContext');

  console.log('6. Importing App...');
  const { default: App } = await import('./App');

  console.log('7. Importing ErrorBoundary...');
  const { default: ErrorBoundary } = await import('./components/ErrorBoundary');

  console.log('8. All imports successful! Creating QueryClient...');

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  console.log('9. Rendering app...');

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <div style={{ minHeight: '100vh', background: '#f0f0f0' }}>
        <HelmetProvider>
          <SupabaseProvider>
            <BrowserRouter>
              <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                  <App />
                </ErrorBoundary>
              </QueryClientProvider>
            </BrowserRouter>
          </SupabaseProvider>
        </HelmetProvider>
      </div>
    </React.StrictMode>
  );

  console.log('10. Render complete!');
} catch (error) {
  console.error('❌ ERROR FOUND:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; background: #ffcccc; color: #cc0000; font-family: monospace;">
      <h1>Error Loading App</h1>
      <h2>${error.message}</h2>
      <pre>${error.stack}</pre>
    </div>
  `;
}
