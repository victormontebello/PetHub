import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CreateListingPage } from './pages/CreateListingPage';
import { ProductsPage } from './pages/ProductsPage';
import { CartProvider } from './contexts/CartContext';
import { CartPage } from './pages/CartPage';
import { ErrorBoundary } from './components/ErrorBoundary';

const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const PetsPage = lazy(() => import('./pages/PetsPage').then(module => ({ default: module.PetsPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(module => ({ default: module.ServicesPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors">
                <Header />
                <main className="pt-16 px-2 sm:px-4">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/pets" element={<PetsPage />} />
                      <Route path="/services" element={<ServicesPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                      <Route path="/create-listing" element={<PrivateRoute><CreateListingPage /></PrivateRoute>} />
                      <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
            </Router>
          </AuthProvider>
        </CartProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;