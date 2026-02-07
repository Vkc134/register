import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import ApplicationForm from './pages/user/ApplicationForm';
import Dashboard from './pages/admin/Dashboard';
import CandidateDetail from './pages/admin/CandidateDetail';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Or a spinner

  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route element={<Layout />}>
              <Route path="/user" element={
                <ProtectedRoute allowedRole="candidate">
                  <ApplicationForm />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute allowedRole="admin">
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/candidate/:id" element={
                <ProtectedRoute allowedRole="admin">
                  <CandidateDetail />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
