import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import "./LoginPage.css";

const LoginPage = () => {
    const navigate = useNavigate();
const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Site Supervisor",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
  event.preventDefault();

  const roleMap = {
    "Site Supervisor": "site-supervisor",
    "Planning Engineer": "planning-engineer",
    "Project Manager": "project-manager",
  };

  const result = login(
    formData.email,
    formData.password,
    roleMap[formData.role]
  );

  if (!result.success) {
    alert(result.message);
    return;
  }

  if (result.user.roleKey === "site-supervisor") {
    navigate("/site-supervisor");
    return;
  }

  if (result.user.roleKey === "planning-engineer") {
    navigate("/planning-engineer");
    return;
  }

  if (result.user.roleKey === "project-manager") {
    navigate("/project-manager");
  }
};

  return (
    <div className="login-page">
      <div className="login-container">

        {/* -------------------------------------------------
            LEFT BRANDING PANEL
        ------------------------------------------------- */}
        <section className="login-brand-panel">
          <div className="brand-content">

            <div className="brand-icon">
              <Building2 size={32} strokeWidth={1.8} />
            </div>

            <p className="brand-eyebrow">
              INTELLIGENT PROJECT TRACKING SYSTEM
            </p>

            <h1>PROGRESS BRIDGE</h1>

            <p className="brand-subtitle">
              Planning-to-Execution Bridge
            </p>

            <p className="brand-description">
              Connect planned project schedules with actual
              field execution, progress tracking, and delay
              monitoring in one connected platform.
            </p>

            <div className="brand-flow">
              <div className="flow-item">
                <span>01</span>
                <div>
                  <strong>Plan</strong>
                  <p>Planned project schedule</p>
                </div>
              </div>

              <div className="flow-line"></div>

              <div className="flow-item">
                <span>02</span>
                <div>
                  <strong>Execute</strong>
                  <p>Actual field progress</p>
                </div>
              </div>

              <div className="flow-line"></div>

              <div className="flow-item">
                <span>03</span>
                <div>
                  <strong>Monitor</strong>
                  <p>Variance and delays</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* -------------------------------------------------
            RIGHT LOGIN PANEL
        ------------------------------------------------- */}
        <section className="login-form-panel">

          <div className="login-card">

            <div className="login-header">
              <p className="section-label">
                PROJECT ACCESS
              </p>

              <h2>Welcome back</h2>

              <p>
                Sign in to access your Progress Bridge workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* EMAIL */}
              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="input-wrapper">
                  <Mail size={18} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="form-group">
                <label htmlFor="password">
                  Password
                </label>

                <div className="input-wrapper">
                  <Lock size={18} />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* ROLE */}
              <div className="form-group">
                <label htmlFor="role">
                  Select Role
                </label>

                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Site Supervisor">
                    Site Supervisor
                  </option>

                  <option value="Project Manager">
                    Project Manager
                  </option>

                  <option value="Planning Engineer">
                    Planning Engineer
                  </option>
                </select>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className="login-button"
              >
                <span>SIGN IN</span>
                <ArrowRight size={19} />
              </button>

            </form>

            {/* DEMO CREDENTIALS */}
            <div className="demo-credentials">

              <div className="demo-header">
                <span>DEMO ACCESS</span>
              </div>

              <div className="credential-row">
                <span>Site Supervisor</span>
                <code>
                  supervisor@progressbridge.com
                </code>
              </div>

              <div className="credential-row">
                <span>Password</span>
                <code>123456</code>
              </div>

              <div className="credential-divider"></div>

              <div className="credential-row">
                <span>Project Manager</span>
                <code>
                  pm@progressbridge.com
                </code>
              </div>

              <div className="credential-row">
                <span>Password</span>
                <code>pm123</code>
              </div>

              <div className="credential-divider"></div>

              <div className="credential-row">
                <span>Planning Engineer</span>
                <code>
                  planning@progressbridge.com
                </code>
              </div>

              <div className="credential-row">
                <span>Password</span>
                <code>planning123</code>
              </div>

            </div>

            <p className="login-footer">
              Progress Bridge · Planning-to-Execution Bridge
            </p>

          </div>

        </section>

      </div>
    </div>
  );
};

export default LoginPage;