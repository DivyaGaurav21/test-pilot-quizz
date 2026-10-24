import { Routes, Route } from "react-router-dom";
import Header from './components/common/Header.jsx';
import Footer from "./components/common/Footer.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Exams from "./pages/Exams.jsx";
import ExamInstructions from "./pages/ExamInstructions.jsx";
import ExamPage from "./pages/ExamPage.jsx";
import ResultPage from "./pages/ResultPage.jsx";
import Profile from "./pages/Profile.jsx";
import InstituteDashboard from "./pages/InstituteDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import Institutes from "./pages/Institutes.jsx";
import Pricing from "./pages/Pricing.jsx";
import Blog from "./pages/Blog.jsx";
import About from "./pages/About.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminImport from "./pages/admin/AdminImport.jsx";
import InstituteApplications from "./pages/admin/InstituteApplications.jsx";
import FinanceDashboard from "./pages/admin/FinanceDashboard.jsx";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/institutes" element={<Institutes />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />

          {/* User routes (require authentication) */}
          <Route
            path="/exams/:id/instructions"
            element={
              <ProtectedRoute>
                <ExamInstructions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams/:id/start"
            element={
              <ProtectedRoute>
                <ExamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results/:id"
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/institute"
            element={
              <ProtectedRoute>
                <InstituteDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin routes (require authentication + admin role) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/import"
            element={
              <ProtectedRoute adminOnly>
                <AdminImport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/institutes"
            element={
              <ProtectedRoute superAdminOnly>
                <InstituteApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <ProtectedRoute superAdminOnly>
                <FinanceDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
