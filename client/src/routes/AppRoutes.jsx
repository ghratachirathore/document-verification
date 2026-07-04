import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { AuthPage } from "../pages/AuthPage.jsx";
import { CandidateDashboard } from "../pages/CandidateDashboard.jsx";
import { CandidateDetailPage } from "../pages/CandidateDetailPage.jsx";
import { CandidateExplorerPage } from "../pages/CandidateExplorerPage.jsx";
import { HrDashboard } from "../pages/HrDashboard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="boot-screen">Loading EduVerify AI...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === "hr" ? "/hr" : "/candidate"} replace />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="boot-screen">Loading EduVerify AI...</div>;
  if (user) return <Navigate to={user.role === "hr" ? "/hr" : "/candidate"} replace />;
  return children;
};

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="boot-screen">Loading EduVerify AI...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "hr" ? "/hr" : "/candidate"} replace />;
};

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><AuthPage mode="register" /></PublicRoute>} />
    <Route
      path="/candidate"
      element={
        <ProtectedRoute roles={["candidate"]}>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<CandidateDashboard />} />
      <Route path="evidence" element={<CandidateDashboard view="evidence" />} />
      <Route path="documents" element={<CandidateDashboard view="documents" />} />
      <Route path="timeline" element={<CandidateDashboard view="timeline" />} />
      <Route path="clarifications" element={<CandidateDashboard view="clarifications" />} />
    </Route>
    <Route
      path="/hr"
      element={
        <ProtectedRoute roles={["hr"]}>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<HrDashboard />} />
      <Route path="queue" element={<HrDashboard view="queue" />} />
      <Route path="hiring" element={<HrDashboard view="hiring" />} />
      <Route path="verification" element={<HrDashboard view="verification" />} />
      <Route path="explorer" element={<CandidateExplorerPage />} />
      <Route path="candidates" element={<CandidateExplorerPage />} />
      <Route path="candidates/:id" element={<CandidateDetailPage />} />
    </Route>
    <Route path="*" element={<RoleRedirect />} />
  </Routes>
);
