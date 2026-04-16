import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type AuthMode = "login" | "register";

export default function Login() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [requestedRole, setRequestedRole] = useState<"user" | "admin">("user");
  const [adminInviteCode, setAdminInviteCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuth = async () => {
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        mode,
        email,
        name,
        password,
        requestedRole,
        adminInviteCode
      });

      const user = res.data;
      localStorage.setItem("user", JSON.stringify(user));
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (authError: any) {
      setError(authError.response?.data?.message || "Authentication failed.");
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-art">
        <p className="eyebrow">Social Engineering Simulator</p>
        <h1>Practice the moment before the click</h1>
        <p className="lead">
          Run realistic email, SMS, chat, and popup simulations with scoring, feedback, prevention, and recovery guidance.
        </p>
        <div className="security-visual" aria-hidden="true">
          <div className="visual-browser">
            <span />
            <span />
            <span />
          </div>
          <div className="visual-message">
            <strong>Security Review</strong>
            <p>Verify the request through an official channel.</p>
          </div>
          <div className="visual-alert">Report suspicious request</div>
        </div>
      </section>

      <section className="panel auth-panel">
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>Login</button>
          <button className={mode === "register" ? "selected" : ""} onClick={() => setMode("register")}>Register</button>
        </div>

        <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>

        {mode === "register" && (
          <label>
            Name
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {mode === "register" && (
          <>
            <div className="role-toggle">
              <button className={requestedRole === "user" ? "selected" : ""} onClick={() => setRequestedRole("user")}>Learner</button>
              <button className={requestedRole === "admin" ? "selected" : ""} onClick={() => setRequestedRole("admin")}>Admin</button>
            </div>

            {requestedRole === "admin" && (
              <label>
                Admin invite code
                <input
                  type="password"
                  placeholder="Required for admin registration"
                  value={adminInviteCode}
                  onChange={(event) => setAdminInviteCode(event.target.value)}
                />
              </label>
            )}
          </>
        )}

        {error && <p className="error-text">{error}</p>}

        <button onClick={handleAuth}>{mode === "login" ? "Login" : "Register"}</button>
      </section>
    </main>
  );
}
