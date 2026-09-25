import { Routes, Route } from 'react-router-dom';
// import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Exams from './pages/Exams.jsx';
// import ExamInstructions from './pages/ExamInstructions.jsx';
// import ExamPage from './pages/ExamPage.jsx';
// import ResultPage from './pages/ResultPage.jsx';
// import Profile from './pages/Profile.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
// import AdminImport from './pages/admin/AdminImport.jsx';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}

      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/exams" element={<Exams />} />

          {/* User routes (require authentication) */}
          {/* <Route
            path="/exams/:id/instructions"
            element={
              <ProtectedRoute>
                <ExamInstructions />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/exams/:id/attempt"
            element={
              <ProtectedRoute>
                <ExamPage />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/results/:id"
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          /> */}

          {/* Admin routes (require authentication + admin role) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/admin/import"
            element={
              <ProtectedRoute adminOnly>
                <AdminImport />
              </ProtectedRoute>
            }
          /> */}
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
