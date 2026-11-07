import { useCallback, useEffect, useState } from 'react';
import './CompanyPortal.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

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
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Something went wrong',
    );
  }

  return data;
}

export default function CompanyPortal({ onBack }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [companyToken, setCompanyToken] = useState(
    () => sessionStorage.getItem('companyAccessToken') || '',
  );

  const [employeeToken, setEmployeeToken] = useState(
    () => sessionStorage.getItem('employeeAccessToken') || '',
  );

  const [company, setCompany] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('Home');

  const [employees, setEmployees] = useState([]);
  const [memberForm, setMemberForm] = useState({ name: '', email: '' });
  const [credentials, setCredentials] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [mustChangePassword, setMustChangePassword] = useState(false);

  const logout = useCallback(() => {
    sessionStorage.removeItem('companyAccessToken');
    sessionStorage.removeItem('employeeAccessToken');
    setCompanyToken('');
    setEmployeeToken('');
    setCompany(null);
    setEmployee(null);
    setEmployees([]);
    setCredentials(null);
    setMustChangePassword(false);
    setMode('login');
    setActiveTab('Home');
    setError('');
    setSuccess('');
  }, []);

  const loadCompany = useCallback(async (token) => {
    try {
      const response = await fetch(`${API}/api/companies/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponse(response);
      setCompany(data.company);
    } catch (err) {
      setError(err.message);
      logout();
    }
  }, [logout]);

  const loadEmployees = useCallback(async () => {
    if (!companyToken) return;

    try {
      setMemberLoading(true);
      const response = await fetch(`${API}/api/companies/employees`, {
        headers: { Authorization: `Bearer ${companyToken}` },
      });
      const data = await readResponse(response);
      setEmployees(data.employees || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setMemberLoading(false);
    }
  }, [companyToken]);

  const loadEmployeeProfile = useCallback(async (token) => {
    try {
      const response = await fetch(`${API}/api/employees/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponse(response);
      setEmployee(data.employee);
      setMustChangePassword(false);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (companyToken) loadCompany(companyToken);
  }, [companyToken, loadCompany]);

  useEffect(() => {
    if (employeeToken && !mustChangePassword) {
      loadEmployeeProfile(employeeToken);
    }
  }, [employeeToken, mustChangePassword, loadEmployeeProfile]);

  useEffect(() => {
    if (companyToken && activeTab === 'Members') loadEmployees();
  }, [companyToken, activeTab, loadEmployees]);

  function handleChange(event) {
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'employee-login') {
        const response = await fetch(`${API}/api/employees/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loginId: form.username,
            password: form.password,
          }),
        });

        const data = await readResponse(response);

        sessionStorage.setItem('employeeAccessToken', data.accessToken);
        setEmployeeToken(data.accessToken);
        setMustChangePassword(data.mustChangePassword);
        setForm(initialForm);

        if (data.mustChangePassword) {
          setSuccess('Login successful. Please change your temporary password.');
        }
      } else {
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

        const response = await fetch(`${API}/api/companies/auth/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await readResponse(response);

        if (mode === 'register') {
          setSuccess('Company registered successfully. Please log in.');
          setMode('login');
          setForm({ ...initialForm, email: payload.email });
        } else {
          sessionStorage.setItem('companyAccessToken', data.accessToken);
          setCompanyToken(data.accessToken);
          setCompany(data.company);
          setForm(initialForm);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createEmployee(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setCredentials(null);

    try {
      const response = await fetch(`${API}/api/companies/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${companyToken}`,
        },
        body: JSON.stringify({
          name: memberForm.name.trim(),
          email: memberForm.email.trim(),
        }),
      });

      const data = await readResponse(response);

      setCredentials(data.credentials);
      setSuccess('Employee account created successfully.');
      setMemberForm({ name: '', email: '' });
      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  }

  async function changeEmployeePassword(event) {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API}/api/employees/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employeeToken}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await readResponse(response);

      setSuccess(data.message);
      setMustChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  if (employeeToken && mustChangePassword) {
    return (
      <div className="company-auth-page">
        <section className="company-auth-form-area">
          <div className="company-auth-form">
            <h2>Change Temporary Password</h2>
            <p>You must create a new password before accessing your dashboard.</p>

            {error && <div className="company-alert error-alert">{error}</div>}
            {success && <div className="company-alert">{success}</div>}

            <form onSubmit={changeEmployeePassword}>
              <div className="company-field">
                <label>Temporary password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })}
                />
              </div>

              <div className="company-field">
                <label>New password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })}
                />
              </div>

              <button className="company-submit-button" type="submit">
                Change Password
              </button>
            </form>

            <button className="company-secondary-button" onClick={logout}>
              Log out
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (employeeToken && employee) {
    return (
      <div className="company-dashboard">
        <aside className="company-sidebar">
          <div className="company-brand">
            <span className="company-brand-icon">C</span>
            <span>CompanySpace</span>
          </div>

          <div className="company-workspace-label">EMPLOYEE WORKSPACE</div>

          <nav className="company-nav">
            {['Home', 'Posts'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? 'company-nav-item active' : 'company-nav-item'}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <button className="company-logout" onClick={logout}>
            Log out
          </button>
        </aside>

        <main className="company-main">
          <header className="company-topbar">
            <div>
              <span className="company-topbar-label">EMPLOYEE WORKSPACE</span>
              <h2>{activeTab}</h2>
            </div>
            <div className="company-avatar">
              {employee.name.charAt(0).toUpperCase()}
            </div>
          </header>

          {activeTab === 'Home' ? (
            <section className="company-info-card">
              <h2>Welcome, {employee.name}!</h2>
              <div className="company-info-row">
                <span>Employee name</span>
                <strong>{employee.name}</strong>
              </div>
              <div className="company-info-row">
                <span>Email</span>
                <strong>{employee.email}</strong>
              </div>
              <div className="company-info-row">
                <span>Login ID</span>
                <strong>{employee.loginId}</strong>
              </div>
              <div className="company-info-row">
                <span>Company</span>
                <strong>{employee.company?.name}</strong>
              </div>
              <div className="company-info-row">
                <span>Account status</span>
                <strong>{employee.status}</strong>
              </div>
              <div className="company-info-row">
                <span>Account created</span>
                <strong>{new Date(employee.createdAt).toLocaleDateString()}</strong>
              </div>
            </section>
          ) : (
            <section className="company-placeholder">
              <h2>Posts</h2>
              <p>Company posts will be available here in a future update.</p>
              <span>No posts yet</span>
            </section>
          )}
        </main>
      </div>
    );
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
            {['Home', 'Members', 'Posts', 'Settings'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? 'company-nav-item active' : 'company-nav-item'}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <button className="company-logout" onClick={logout}>
            Log out
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
          {success && <div className="company-alert">{success}</div>}

          {activeTab === 'Home' && (
            <section className="company-welcome">
              <div className="company-welcome-card">
                <span className="company-eyebrow">WELCOME TO YOUR WORKSPACE</span>
                <h1>Hello, {company?.name || 'Company'}!</h1>
                <p>Your company workspace is ready.</p>
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
            <section className="company-info-card employee-members">
              <h2>Company Members</h2>
              <p>Add employees and create their login credentials.</p>

              <form onSubmit={createEmployee}>
                <div className="company-field">
                  <label>Employee name</label>
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({
                      ...memberForm,
                      name: e.target.value,
                    })}
                    placeholder="Enter employee name"
                  />
                </div>

                <div className="company-field">
                  <label>Employee email</label>
                  <input
                    type="email"
                    required
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({
                      ...memberForm,
                      email: e.target.value,
                    })}
                    placeholder="Enter employee email"
                  />
                </div>

                <button className="company-submit-button" type="submit">
                  Add Employee
                </button>
              </form>

              {credentials && (
                <div className="employee-credentials">
                  <h3>Employee account created!</h3>
                  <p>Save these credentials. The temporary password is shown only now.</p>
                  <p><strong>Login ID:</strong> {credentials.loginId}</p>
                  <p><strong>Temporary password:</strong> {credentials.temporaryPassword}</p>
                  <button
                    type="button"
                    className="company-secondary-button"
                    onClick={() => setCredentials(null)}
                  >
                    I have saved the credentials
                  </button>
                </div>
              )}

              <h3>Employee List</h3>

              {memberLoading ? (
                <p>Loading employees...</p>
              ) : employees.length === 0 ? (
                <p>No employees added yet.</p>
              ) : (
                <div className="employee-table-wrap">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Login ID</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td>{item.loginId}</td>
                          <td>{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'Posts' && (
            <section className="company-placeholder">
              <h2>Posts</h2>
              <p>Your company's posts area is ready for future development.</p>
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
            </section>
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
            A dedicated space for your company to manage its profile,
            employees and collaboration.
          </p>
          <div className="company-feature">✓ Secure company authentication</div>
          <div className="company-feature">✓ Protected employee accounts</div>
          <div className="company-feature">✓ Company member management</div>
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
            ← Back
          </button>

          <h2>
            {mode === 'register'
              ? 'Create Company Account'
              : mode === 'employee-login'
                ? 'Employee Login'
                : 'Company Login'}
          </h2>

          <p>
            {mode === 'employee-login'
              ? 'Use the login ID and temporary password provided by your company.'
              : 'Access your private company workspace.'}
          </p>

          {error && <div className="company-alert error-alert">{error}</div>}
          {success && <div className="company-alert">{success}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div className="company-field">
                  <label>Company name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    minLength={2}
                    maxLength={150}
                  />
                </div>

                <div className="company-field">
                  <label>Company username</label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                    maxLength={50}
                    pattern="[a-zA-Z0-9_]+"
                  />
                </div>
              </>
            )}

            <div className="company-field">
              <label>
                {mode === 'employee-login' ? 'Employee Login ID' : 'Company email'}
              </label>
              <input
                name={mode === 'employee-login' ? 'username' : 'email'}
                type="text"
                value={mode === 'employee-login' ? form.username : form.email}
                onChange={handleChange}
                required
                placeholder={mode === 'employee-login' ? 'EMP-XXXXXXXXXX' : 'company@example.com'}
              />
            </div>

            <div className="company-field">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={mode === 'employee-login' ? 1 : 8}
              />
            </div>

            {mode === 'register' && (
              <div className="company-field">
                <label>Confirm password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
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
                  : mode === 'employee-login'
                    ? 'Employee Login'
                    : 'Log in to workspace'}
            </button>
          </form>

          <div className="employee-auth-links">
            {mode !== 'login' && (
              <button type="button" onClick={() => {
                setMode('login');
                setForm(initialForm);
                setError('');
                setSuccess('');
              }}>
                Company Login
              </button>
            )}

            {mode !== 'register' && (
              <button type="button" onClick={() => {
                setMode('register');
                setForm(initialForm);
                setError('');
                setSuccess('');
              }}>
                Register Company
              </button>
            )}

            {mode !== 'employee-login' && (
              <button type="button" onClick={() => {
                setMode('employee-login');
                setForm(initialForm);
                setError('');
                setSuccess('');
              }}>
                Employee Login
              </button>
            )}
          </div>

          <p className="company-auth-footer">
            Protected company access · Secure authentication
          </p>
        </div>
      </section>
    </div>
  );
}