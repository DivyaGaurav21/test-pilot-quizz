// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
// import Loading from './Loading';

// export default function ProtectedRoute({ children, adminOnly = false }) {
//   const { user, loading } = useAuth();

//   if (loading) return <Loading />;

//   if (!user) return <Navigate to="/login" replace />;

//   if (adminOnly && user.role !== 'admin') {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// }


import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import Loading from './Loading.jsx';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/exams" replace />;
  }

  return children;
};

export default ProtectedRoute;