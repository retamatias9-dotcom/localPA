import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AvisoPago from './components/AvisoPago';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminVentas from './pages/AdminVentas';
import AdminFacturacion from './pages/AdminFacturacion';

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
          <AvisoPago />
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
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ventas"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminVentas />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/facturacion"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminFacturacion />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
