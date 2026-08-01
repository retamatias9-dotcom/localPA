import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';

function AppToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      richColors
      position="top-center"
      toastOptions={{ style: { fontFamily: 'var(--font-sans)' } }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppToaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Catalog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/productos/:id"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
