import { GraduationCap, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const demoCredentials = [
  { label: "Candidate", email: "candidate@eduverify.ai", password: "Candidate@123" },
  { label: "HR", email: "hr@eduverify.ai", password: "HR@123456" }
];

export const AuthPage = ({ mode }) => {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: isRegister ? "" : "candidate@eduverify.ai",
    password: isRegister ? "" : "Candidate@123",
    role: "candidate"
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const user = isRegister ? await register(form) : await login(form.email, form.password);
      navigate(user.role === "hr" ? "/hr" : "/candidate");
    } catch (err) {
      const message = err.response?.data?.message;
      setError(message || (isRegister ? "Account creation failed. Check the details and try again." : "Sign in failed. Check your email and password."));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (credential) => {
    setForm((current) => ({
      ...current,
      email: credential.email,
      password: credential.password,
      role: credential.label === "HR" ? "hr" : "candidate"
    }));
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <div className="brand-mark auth-brand">
            <div className="brand-icon">EV</div>
            <div>
              <strong>EduVerify AI</strong>
              <span>Candidate intelligence for HR teams</span>
            </div>
          </div>
          <h1>Credential review that feels ready for hiring teams.</h1>
          <p>
            Upload academic and professional documents, extract structured facts, run deterministic checks, and move
            candidates through a clear review lifecycle.
          </p>
          <div className="auth-assurance">
            <span>
              <ShieldCheck size={18} /> AI extracts
            </span>
            <span>
              <GraduationCap size={18} /> Backend verifies
            </span>
          </div>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <h2>{isRegister ? "Create account" : "Sign in"}</h2>
          <p className="form-helper">{isRegister ? "Use a unique email for new demo candidates." : "Use demo credentials or your registered account."}</p>
          {isRegister ? (
            <>
              <label>
                Full name
                <input name="name" value={form.name} onChange={update} autoComplete="name" required />
              </label>
              <label>
                Role
                <select name="role" value={form.role} onChange={update} aria-label="Account role">
                  <option value="candidate">Candidate</option>
                  <option value="hr">HR</option>
                </select>
              </label>
            </>
          ) : null}
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" minLength={8} value={form.password} onChange={update} autoComplete={isRegister ? "new-password" : "current-password"} required />
          </label>
          {error ? <div className="form-error" role="alert">{error}</div> : null}
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? "Working..." : isRegister ? "Create account" : "Sign in"}
          </button>
          <div className="demo-buttons">
            {demoCredentials.map((credential) => (
              <button key={credential.email} type="button" onClick={() => fillDemo(credential)} aria-label={`Use ${credential.label} demo credentials`}>
                {credential.label}
              </button>
            ))}
          </div>
          <p className="auth-link">
            {isRegister ? "Already have an account?" : "Need an account?"}{" "}
            <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Register"}</Link>
          </p>
        </form>
      </section>
    </main>
  );
};
