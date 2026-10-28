import { useCallback, useEffect, useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
throw new Error('VITE_API_URL is not configured.');
}
const BASE_API_URL = API_URL.replace(/\/+$/, '');
const AUTH_API = `${BASE_API_URL}/auth`;
const PROFILE_API = `${BASE_API_URL}/api/users/me`;

const emptyForm = {
name: '',
email: '',
password: '',
confirmPassword: '',
};

function App() {
const [page, setPage] = useState('login');
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState('');
const [error, setError] = useState('');
const [form, setForm] = useState(emptyForm);

const [token, setToken] = useState(
() => sessionStorage.getItem('accessToken') || '',
);
const [profile, setProfile] = useState(null);
const [editName, setEditName] = useState('');
const [profileLoading, setProfileLoading] = useState(false);
const [savingProfile, setSavingProfile] = useState(false);

async function readResponse(response) {
const data = await response.json().catch(() => ({}));

if (!response.ok) {
  const serverMessage = data.message;
  throw new Error(
    Array.isArray(serverMessage)
      ? serverMessage.join(', ')
      : serverMessage || 'Something went wrong.',
  );
}

return data;

}

function logout(showMessage = true) {
sessionStorage.removeItem('accessToken');
setToken('');
setProfile(null);
setEditName('');
setForm(emptyForm);
setPage('login');
setShowPassword(false);
setError('');
setMessage(showMessage ? 'You have been logged out.' : '');
}

const loadProfile = useCallback(
async (currentToken = token) => {
if (!currentToken) return;

  setProfileLoading(true);
  setError('');
  setMessage('');

  try {
    const response = await fetch(PROFILE_API, {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    const data = await readResponse(response);
    setProfile(data.user);
    setEditName(data.user.name);
  } catch (err) {
    if (
      err.message.toLowerCase().includes('token') ||
      err.message.toLowerCase().includes('authentication') ||
      err.message.toLowerCase().includes('unauthorized')
    ) {
      logout(false);
      setError('Your session has expired. Please log in again.');
    } else {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the server. Please ensure the backend is running.'
          : err.message,
      );
    }
  } finally {
    setProfileLoading(false);
  }
},
[token],

);

useEffect(() => {
  if (!token) return;

  const timer = setTimeout(() => {
    void loadProfile(token);
  }, 0);

  return () => clearTimeout(timer);
}, [token, loadProfile]);

function changePage(nextPage) {
setPage(nextPage);
setMessage('');
setError('');
setShowPassword(false);
setForm(emptyForm);
}

function handleChange(event) {
setForm((previous) => ({
...previous,
[event.target.name]: event.target.value,
}));
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
  const endpoint = page === 'register' ? '/register' : '/login';

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

  const response = await fetch(`${AUTH_API}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await readResponse(response);

  if (page === 'register') {
    setMessage('Registration successful! You can now log in.');
    setForm(emptyForm);
  } else {
    if (!data.accessToken) {
      throw new Error('The server did not return an access token.');
    }

    sessionStorage.setItem('accessToken', data.accessToken);
    setForm(emptyForm);
    setProfile(data.user || null);
    setEditName(data.user?.name || '');
    setToken(data.accessToken);
    setMessage('Login successful.');
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

async function saveProfile(event) {
event.preventDefault();
setError('');
setMessage('');

const name = editName.trim();

if (!name) {
  setError('Name cannot be empty.');
  return;
}

if (name.length > 100) {
  setError('Name must not exceed 100 characters.');
  return;
}

setSavingProfile(true);

try {
  const response = await fetch(PROFILE_API, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  const data = await readResponse(response);
  setProfile(data.user);
  setEditName(data.user.name);
  setMessage('Your profile has been updated successfully.');
} catch (err) {
  setError(
    err.message === 'Failed to fetch'
      ? 'Cannot connect to the server. Please ensure the backend is running.'
      : err.message,
  );
} finally {
  setSavingProfile(false);
}

}

if (token) {
return ( <main className="app-container"> <section className="intro-panel"> <div className="brand"> <div className="brand-icon">A</div> <span>AuthSpace</span> </div>

      <div className="intro-content">
        <span className="eyebrow">YOUR SPACE. YOUR ACCOUNT.</span>
        <h1>
          Your profile.
          <br />
          <span>Your control.</span>
        </h1>
        <p>Manage your personal account details securely.</p>

        <div className="feature-list">
          <div>✓ Protected profile access</div>
          <div>✓ Secure account updates</div>
          <div>✓ Session-based login</div>
        </div>
      </div>

      <p className="copyright">© 2026 AuthSpace · Full Stack Project</p>
    </section>

    <section className="form-panel">
      <div className="form-wrapper">
        <div className="mobile-brand">
          <div className="brand-icon">A</div>
          <span>AuthSpace</span>
        </div>

        <div className="form-heading">
          <span className="eyebrow">ACCOUNT MANAGEMENT</span>
          <h2>My Profile</h2>
          <p>View and update your account information.</p>
        </div>

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

        {profileLoading ? (
          <p role="status">Loading your profile...</p>
        ) : profile ? (
          <>
            <div className="input-group">
              <label htmlFor="accountId">Account ID</label>
              <input id="accountId" value={profile.id} readOnly />
            </div>

            <div className="input-group">
              <label htmlFor="profileEmail">Email Address</label>
              <input
                id="profileEmail"
                value={profile.email}
                readOnly
              />
            </div>

            <form onSubmit={saveProfile}>
              <div className="input-group">
                <label htmlFor="editName">Full Name</label>
                <input
                  id="editName"
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="accountCreated">Account Created</label>
                <input
                  id="accountCreated"
                  value={
                    profile.createdAt
                      ? new Date(profile.createdAt).toLocaleString()
                      : 'Not available'
                  }
                  readOnly
                />
              </div>

              <button
                className="submit-button"
                type="submit"
                disabled={savingProfile || profileLoading}
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>

            <button
              className="submit-button"
              type="button"
              onClick={() => loadProfile()}
              disabled={profileLoading}
              style={{ marginTop: '12px' }}
            >
              Refresh Profile
            </button>
          </>
        ) : (
          <p>Unable to load your profile. Please try again.</p>
        )}

        <button
          className="submit-button"
          type="button"
          onClick={() => logout()}
          style={{ marginTop: '12px' }}
        >
          Log Out
        </button>

        <p className="security-note">
          Your profile is available only with a valid login session.
        </p>
      </div>
    </section>
  </main>
);

}

return ( <main className="app-container"> <section className="intro-panel"> <div className="brand"> <div className="brand-icon">A</div> <span>AuthSpace</span> </div>

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
        Create your account or sign in to continue. Your journey starts
        here.
      </p>

      <div className="feature-list">
        <div>✓ Secure password hashing</div>
        <div>✓ Easy account management</div>
        <div>✓ Simple and responsive design</div>
      </div>
    </div>

    <p className="copyright">© 2026 AuthSpace · Full Stack Project</p>
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
                page === 'login' ? 'current-password' : 'new-password'
              }
              required
            />

            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {page === 'register' && (
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
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

        <button className="submit-button" type="submit" disabled={loading}>
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
