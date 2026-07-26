import { Navigate, useLocation } from 'react-router-dom';
import { useExam } from '../context/ExamContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useExam();
  const location = useLocation();

  if (!user) {
    // Redirect to login if not logged in
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if they try to access something they shouldn't
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
