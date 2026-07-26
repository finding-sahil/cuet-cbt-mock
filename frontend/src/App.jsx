import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExamProvider, useExam } from './context/ExamContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Instructions from './components/Instructions';
import ExamInterface from './components/ExamInterface';
import Result from './components/Result';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
  const { user } = useExam();

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/login" 
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          ) : (
            <Login />
          )
        } 
      />

      {/* Admin Route */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        } 
      />

      {/* Student Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/instructions" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Instructions />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/exam" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <ExamInterface />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/result/:attemptId" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Result />
          </ProtectedRoute>
        } 
      />

      {/* Default Route */}
      <Route 
        path="/" 
        element={
          <Navigate to="/login" replace />
        } 
      />
      
      {/* Catch-all Route */}
      <Route 
        path="*" 
        element={
          <Navigate to="/login" replace />
        } 
      />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ExamProvider>
        <AppRoutes />
      </ExamProvider>
    </BrowserRouter>
  );
};

export default App;
