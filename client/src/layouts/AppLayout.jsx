import { BarChart3, BriefcaseBusiness, ClipboardCheck, FileStack, Layers3, LogOut, Search, ShieldCheck } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = {
  candidate: [
    { to: "/candidate", label: "Intelligence Portal", icon: Layers3 },
    { to: "/candidate/evidence", label: "Evidence Center", icon: ShieldCheck },
    { to: "/candidate/documents", label: "Documents", icon: FileStack },
    { to: "/candidate/timeline", label: "Timeline", icon: ClipboardCheck },
    { to: "/candidate/clarifications", label: "Clarifications", icon: BriefcaseBusiness }
  ],
  hr: [
    { to: "/hr", label: "Command Center", icon: BarChart3 },
    { to: "/hr/queue", label: "Review Queue", icon: ClipboardCheck },
    { to: "/hr/explorer", label: "Explorer", icon: Search },
    { to: "/hr/hiring", label: "Hiring Insights", icon: BriefcaseBusiness },
    { to: "/hr/verification", label: "Verification Insights", icon: ShieldCheck }
  ]
};

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[user.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <div className="brand-icon">EV</div>
          <div>
            <strong>EduVerify AI</strong>
            <span>Credential workspace</span>
          </div>
        </div>
        <nav className="nav-stack" aria-label={`${user.role} navigation`}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === "/candidate" || item.to === "/hr"} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <strong>{user.name}</strong>
            <span>{user.role === "hr" ? "HR Reviewer" : "Candidate"}</span>
          </div>
          <button className="icon-text-button" onClick={handleLogout} type="button">
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>
      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
};
