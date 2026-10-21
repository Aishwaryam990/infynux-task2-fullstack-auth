import { useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/auth';

function App() {
  const [page, setPage] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  function changePage(nextPage) {
    setPage(nextPage);
    setMessage('');
    setError('');
    setShowPassword(false);
    setForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  }

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    const email = form.email.trim().toLowerCase();

    if (page === 'register') {
      if (!form.name.trim()) {
        setError('Please enter your full name.');
        return;
      }

      if (form.name.trim().length > 100) {
        setError('Name must not exceed 100 characters.');
        return;
      }

      if (form.password.length < 8 || form.password.length > 72) {
        setError('Password must be between 8 and 72 characters.');
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint =
        page === 'register' ? '/register' : '/login';

      const payload =
        page === 'register'
          ? {
              name: form.name.trim(),
              email,
              password: form.password,
            }
          : {
              email,
              password: form.password,
            };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const serverMessage = data.message;
        throw new Error(
          Array.isArray(serverMessage)
            ? serverMessage.join(', ')
            : serverMessage || 'Something went wrong.',
        );
      }

      if (page === 'register') {
        setMessage('Registration successful! You can now log in.');
        setForm({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
      } else {
        setMessage(`Welcome, ${data.user.name}! Login successful.`);
        setForm({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the server. Please ensure the backend is running.'
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-container">
      <section className="intro-panel">
        <div className="brand">
          <div className="brand-icon">A</div>
          <span>AuthSpace</span>
        </div>

        <div className="intro-content">
          <span className="eyebrow">YOUR SPACE. YOUR ACCOUNT.</span>
          <h1>
            A simpler way
            <br />
            to manage your
            <br />
            <span>digital life.</span>
          </h1>
          <p>
            Create your account or sign in to continue.
            Your journey starts here.
          </p>

          <div className="feature-list">
            <div>✓ Secure password hashing</div>
            <div>✓ Easy account management</div>
            <div>✓ Simple and responsive design</div>
          </div>
        </div>

        <p className="copyright">
          © 2026 AuthSpace · Full Stack Project
        </p>
      </section>

      <section className="form-panel">
        <div className="form-wrapper">
          <div className="mobile-brand">
            <div className="brand-icon">A</div>
            <span>AuthSpace</span>
          </div>

          <div className="form-heading">
            <span className="eyebrow">
              {page === 'login' ? 'WELCOME BACK' : 'GET STARTED'}
            </span>

            <h2>
              {page === 'login'
                ? 'Sign in to your account'
                : 'Create your account'}
            </h2>

            <p>
              {page === 'login'
                ? 'Enter your details to continue.'
                : 'Fill in the details below to join us.'}
            </p>
          </div>

          <div className="tabs">
            <button
              type="button"
              className={page === 'login' ? 'tab active' : 'tab'}
              onClick={() => changePage('login')}
            >
              Sign In
            </button>

            <button
              type="button"
              className={page === 'register' ? 'tab active' : 'tab'}
              onClick={() => changePage('register')}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {page === 'register' && (
              <div className="input-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                maxLength={255}
                autoComplete="email"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>

              <div className="password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={page === 'register' ? 8 : undefined}
                  maxLength={72}
                  autoComplete={
                    page === 'login'
                      ? 'current-password'
                      : 'new-password'
                  }
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {page === 'register' && (
              <div className="input-group">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password again"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  maxLength={72}
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            {error && (
              <div className="alert error-alert" role="alert">
                {error}
              </div>
            )}

            {message && (
              <div className="alert success-alert" role="status">
                {message}
              </div>
            )}

            <button
              className="submit-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : page === 'login'
                  ? 'Sign In →'
                  : 'Create Account →'}
            </button>
          </form>

          <p className="switch-text">
            {page === 'login'
              ? "Don't have an account?"
              : 'Already have an account?'}{' '}
            <button
              type="button"
              className="text-button"
              onClick={() =>
                changePage(page === 'login' ? 'register' : 'login')
              }
            >
              {page === 'login' ? 'Register now' : 'Sign in'}
            </button>
          </p>

          <p className="security-note">
            Your account details are processed securely.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;