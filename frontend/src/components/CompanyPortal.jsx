import { useCallback, useEffect, useState } from 'react';
import './CompanyPortal.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000')
  .replace(/\/$/, '');

const COMPANY_AUTH_API = `${API_BASE}/api/companies/auth`;
const COMPANY_DASHBOARD_API = `${API_BASE}/api/companies/dashboard`;

const initialForm = {
  name: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
};

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'Something went wrong. Please try again.';

    throw new Error(message);
  }

  return data;
}

export default function CompanyPortal({ onBack }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companyToken, setCompanyToken] = useState(
    () => sessionStorage.getItem('companyAccessToken') || ''
  );
  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('Home');
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const logout = useCallback(() => {
    sessionStorage.removeItem('companyAccessToken');
    setCompanyToken('');
    setCompany(null);
    setForm(initialForm);
    setMode('login');
    setActiveTab('Home');
    setError('');
    setSuccess('');
  }, []);

  const loadDashboard = useCallback(async (token) => {
    setDashboardLoading(true);
    setError('');

    try {
      const response = await fetch(COMPANY_DASHBOARD_API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);
      setCompany(data.company);
    } catch (err) {
      setError(err.message);
      if (
        err.message.toLowerCase().includes('token') ||
        err.message.toLowerCase().includes('unauthorized')
      ) {
        logout();
      }
    } finally {
      setDashboardLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (companyToken) {
      loadDashboard(companyToken);
    }
  }, [companyToken, loadDashboard]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'register' ? 'register' : 'login';

      const payload = mode === 'register'
        ? {
            name: form.name.trim(),
            email: form.email.trim(),
            username: form.username.trim().toLowerCase(),
            password: form.password,
            confirmPassword: form.confirmPassword,
          }
        : {
            email: form.email.trim(),
            password: form.password,
          };

      const response = await fetch(`${COMPANY_AUTH_API}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await readResponse(response);

      if (mode === 'register') {
        setSuccess('Company registered successfully. Please log in.');
        setMode('login');
        setForm({
          ...initialForm,
          email: payload.email,
        });
      } else {
        sessionStorage.setItem('companyAccessToken', data.accessToken);
        setCompanyToken(data.accessToken);
        setCompany(data.company);
        setForm(initialForm);
        setSuccess('Login successful.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setForm(initialForm);
    setError('');
    setSuccess('');
    setShowPassword(false);
  }

  if (companyToken) {
    return (
      <div className="company-dashboard">
        <aside className="company-sidebar">
          <div className="company-brand">
            <span className="company-brand-icon">C</span>
            <span>CompanySpace</span>
          </div>

          <div className="company-workspace-label">WORKSPACE</div>

          <nav className="company-nav">
            {['Home', 'Members', 'Posts', 'Settings'].map((item) => (
              <button
                key={item}
                className={activeTab === item ? 'company-nav-item active' : 'company-nav-item'}
                onClick={() => setActiveTab(item)}
                type="button"
              >
                <span>{{
                  Home: '⌂',
                  Members: '♙',
                  Posts: '▤',
                  Settings: '⚙',
                }[item]}</span>
                {item}
              </button>
            ))}
          </nav>

          <button className="company-logout" onClick={logout} type="button">
            ↪ Log out
          </button>
        </aside>

        <main className="company-main">
          <header className="company-topbar">
            <div>
              <span className="company-topbar-label">COMPANY WORKSPACE</span>
              <h2>{activeTab}</h2>
            </div>
            <div className="company-avatar">
              {(company?.name || 'C').charAt(0).toUpperCase()}
            </div>
          </header>

          {error && <div className="company-alert error-alert">{error}</div>}

          {dashboardLoading ? (
            <div className="company-loading">Loading your company workspace...</div>
          ) : (
            <>
              {activeTab === 'Home' && (
                <section className="company-welcome">
                  <div className="company-welcome-card">
                    <span className="company-eyebrow">WELCOME TO YOUR WORKSPACE</span>
                    <h1>Hello, {company?.name || 'Company'}!</h1>
                    <p>
                      Your company workspace is ready. Manage your company
                      information from this dashboard.
                    </p>
                  </div>

                  <div className="company-info-card">
                    <h3>Company Profile</h3>
                    <div className="company-info-row">
                      <span>Company name</span>
                      <strong>{company?.name || 'Not available'}</strong>
                    </div>
                    <div className="company-info-row">
                      <span>Email address</span>
                      <strong>{company?.email || 'Not available'}</strong>
                    </div>
                    <div className="company-info-row">
                      <span>Company username</span>
                      <strong>{company?.username || 'Not available'}</strong>
                    </div>
                    <div className="company-info-row">
                      <span>Account created</span>
                      <strong>
                        {company?.createdAt
                          ? new Date(company.createdAt).toLocaleDateString()
                          : 'Not available'}
                      </strong>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'Members' && (
                <section className="company-placeholder">
                  <div className="company-placeholder-icon">♙</div>
                  <h2>Members</h2>
                  <p>
                    Your company member management area will appear here.
                  </p>
                  <span>Coming in a future update</span>
                </section>
              )}

              {activeTab === 'Posts' && (
                <section className="company-placeholder">
                  <div className="company-placeholder-icon">▤</div>
                  <h2>Posts</h2>
                  <p>
                    Your company's posts area is ready for future development.
                  </p>
                  <span>No posts yet</span>
                </section>
              )}

              {activeTab === 'Settings' && (
                <section className="company-info-card company-settings">
                  <h3>Company Settings</h3>
                  <p>Basic information saved in your company account.</p>
                  <div className="company-info-row">
                    <span>Company</span>
                    <strong>{company?.name || 'Not available'}</strong>
                  </div>
                  <div className="company-info-row">
                    <span>Username</span>
                    <strong>{company?.username || 'Not available'}</strong>
                  </div>
                  <button className="company-secondary-button" onClick={logout}>
                    Log out of company account
                  </button>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="company-auth-page">
      <section className="company-auth-intro">
        <div className="company-brand">
          <span className="company-brand-icon">C</span>
          <span>CompanySpace</span>
        </div>

        <div className="company-intro-content">
          <span className="company-eyebrow">PRIVATE COMPANY PLATFORM</span>
          <h1>One workspace.<br />Your company.</h1>
          <p>
            A dedicated space for your company to get started,
            manage its profile and prepare for collaboration.
          </p>
          <div className="company-feature">
            <span>✓</span> Secure company authentication
          </div>
          <div className="company-feature">
            <span>✓</span> Your own protected workspace
          </div>
          <div className="company-feature">
            <span>✓</span> Simple company dashboard
          </div>
        </div>

        <span className="company-intro-footer">
          CompanySpace · Private Company Social Platform
        </span>
      </section>

      <section className="company-auth-form-area">
        <div className="company-auth-form">
          <button
            type="button"
            className="company-back-button"
            onClick={onBack}
          >
            ← Back to personal account
          </button>

          <span className="company-eyebrow">
            {mode === 'register' ? 'CREATE YOUR WORKSPACE' : 'COMPANY ACCESS'}
          </span>

          <h2>
            {mode === 'register' ? 'Register your company' : 'Welcome back'}
          </h2>

          <p className="company-form-description">
            {mode === 'register'
              ? 'Enter your company details to create an account.'
              : 'Log in to access your company workspace.'}
          </p>

          <div className="company-auth-tabs">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => switchMode('register')}
            >
              Register
            </button>
          </div>

          {error && <div className="company-alert error-alert">{error}</div>}
          {success && <div className="company-alert success-alert">{success}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div className="company-field">
                  <label htmlFor="company-name">Company name</label>
                  <input
                    id="company-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    maxLength={150}
                    required
                  />
                </div>

                <div className="company-field">
                  <label htmlFor="company-username">Company username</label>
                  <input
                    id="company-username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="e.g. infynux_solutions"
                    minLength={3}
                    maxLength={50}
                    pattern="[a-zA-Z0-9_]+"
                    title="Use letters, numbers and underscores only."
                    required
                  />
                </div>
              </>
            )}

            <div className="company-field">
              <label htmlFor="company-email">Company email</label>
              <input
                id="company-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="company@example.com"
                required
              />
            </div>

            <div className="company-field">
              <label htmlFor="company-password">Password</label>
              <div className="company-password-wrap">
                <input
                  id="company-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="company-field">
                <label htmlFor="company-confirm-password">Confirm password</label>
                <input
                  id="company-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  minLength={8}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="company-submit-button"
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : mode === 'register'
                  ? 'Create company account'
                  : 'Log in to workspace'}
            </button>
          </form>

          <p className="company-auth-footer">
            Protected company access · Secure authentication
          </p>
        </div>
      </section>
    </div>
  );
}