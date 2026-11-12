import { useCallback, useEffect, useState } from 'react';
import './PostsSection.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Unable to complete the request',
    );
  }
  return data;
}

function getPostList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.posts)) return data.posts;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

function formatDate(value) {
  if (!value) return 'Just now';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Just now' : date.toLocaleString();
}

export default function PostsSection({ token, mode = 'feed', employee = null }) {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editContent, setEditContent] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = mode === 'admin';
  const isMine = mode === 'mine';

  const loadPosts = useCallback(async (requestedPage = 1, append = false) => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      let endpoint = '/api/posts';
      if (isAdmin) endpoint = '/api/admin/posts';
      else if (isMine) endpoint = '/api/posts/my';
      else endpoint = `/api/posts?page=${requestedPage}`;

      const response = await fetch(`${API}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponse(response);
      const nextPosts = getPostList(data);

      setPosts((previous) => append ? [...previous, ...nextPosts] : nextPosts);
      setPage(Number(data.page) || requestedPage);
      setTotalPages(Number(data.totalPages) || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin, isMine]);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setTotalPages(1);
    loadPosts(1, false);
  }, [loadPosts]);

  async function createPost(event) {
    event.preventDefault();
    const trimmed = content.trim();
    setError('');
    setSuccess('');

    if (!trimmed) {
      setError('Post content cannot be empty.');
      return;
    }
    if (trimmed.length > 2000) {
      setError('A post can contain a maximum of 2000 characters.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: trimmed }),
      });
      await readResponse(response);
      setContent('');
      setSuccess('Your post was published.');
      await loadPosts(1, false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(post) {
    setEditingId(post.id);
    setEditContent(post.content || '');
    setError('');
    setSuccess('');
  }

  async function saveEdit(postId) {
    const trimmed = editContent.trim();
    setError('');
    setSuccess('');
    if (!trimmed) {
      setError('Post content cannot be empty.');
      return;
    }
    if (trimmed.length > 2000) {
      setError('A post can contain a maximum of 2000 characters.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API}/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: trimmed }),
      });
      await readResponse(response);
      setEditingId('');
      setEditContent('');
      setSuccess('Post updated successfully.');
      await loadPosts(isMine || isAdmin ? 1 : page, false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(post) {
    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const endpoint = isAdmin
        ? `${API}/api/admin/posts/${post.id}`
        : `${API}/api/posts/${post.id}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await readResponse(response);
      setSuccess('Post deleted successfully.');
      await loadPosts(isMine || isAdmin ? 1 : page, false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const heading = isAdmin ? 'Company Posts' : isMine ? 'My Posts' : 'Company Feed';

  return (
    <section className="posts-section">
      <div className="posts-heading-row">
        <div>
          <span className="posts-eyebrow">COMPANYSPACE SOCIAL</span>
          <h2>{heading}</h2>
          <p>{isAdmin
            ? 'Review and moderate posts shared by employees in your company.'
            : isMine
              ? 'All posts you have shared with your company.'
              : 'Updates shared by employees in your company, newest first.'}</p>
        </div>
        <button
          type="button"
          className="posts-refresh-button"
          onClick={() => loadPosts(1, false)}
          disabled={loading || saving}
        >
          ↻ Refresh
        </button>
      </div>

      {error && <div className="company-alert error-alert">{error}</div>}
      {success && <div className="company-alert success-alert">{success}</div>}

      {!isAdmin && !isMine && (
        <form className="posts-composer" onSubmit={createPost}>
          <div className="posts-composer-title">
            <div className="posts-avatar">{employee?.name?.charAt(0)?.toUpperCase() || 'Y'}</div>
            <div>
              <strong>Share an update</strong>
              <span>Posting as {employee?.name || 'you'}</span>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What's happening at work?"
            maxLength={2000}
            rows={4}
            aria-label="Write a post"
          />
          <div className="posts-composer-footer">
            <span>{content.length}/2000 characters</span>
            <button className="company-submit-button" type="submit" disabled={saving}>
              {saving ? 'Publishing...' : 'Publish post'}
            </button>
          </div>
        </form>
      )}

      {loading && posts.length === 0 ? (
        <div className="posts-empty-state">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="posts-empty-state">
          <div className="posts-empty-icon">✎</div>
          <h3>No posts yet</h3>
          <p>{isAdmin
            ? 'There are no posts from your company employees yet.'
            : isMine
              ? 'Posts you publish will appear here.'
              : 'Be the first to share an update with your company.'}</p>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map((post) => {
            const authorName = post.author?.name || post.authorName || 'Company employee';
            const isOwnPost = Boolean(employee && (
              post.authorId === employee.id || post.author?.id === employee.id
            ));

            return (
              <article className="social-post-card" key={post.id}>
                <div className="social-post-top">
                  <div className="posts-avatar">{authorName.charAt(0).toUpperCase()}</div>
                  <div className="social-post-author">
                    <strong>{authorName}{isOwnPost ? <span className="posts-you-badge">You</span> : null}</strong>
                    <span>{formatDate(post.createdAt)}{post.updatedAt && post.updatedAt !== post.createdAt ? ' · edited' : ''}</span>
                  </div>
                  {(isAdmin || isOwnPost || isMine) && (
                    <div className="social-post-actions">
                      {!isAdmin && (isOwnPost || isMine) && editingId !== post.id && (
                        <button type="button" onClick={() => startEdit(post)} disabled={saving}>Edit</button>
                      )}
                      <button type="button" className="posts-delete-button" onClick={() => deletePost(post)} disabled={saving}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {editingId === post.id ? (
                  <div className="posts-edit-area">
                    <textarea
                      value={editContent}
                      onChange={(event) => setEditContent(event.target.value)}
                      maxLength={2000}
                      rows={4}
                      aria-label="Edit post"
                    />
                    <div className="posts-edit-actions">
                      <span>{editContent.length}/2000 characters</span>
                      <button type="button" className="posts-cancel-button" onClick={() => setEditingId('')}>Cancel</button>
                      <button type="button" className="company-submit-button" onClick={() => saveEdit(post.id)} disabled={saving}>
                        {saving ? 'Saving...' : 'Save changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="social-post-content">{post.content}</p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!isAdmin && !isMine && page < totalPages && (
        <div className="posts-load-more-wrap">
          <button
            type="button"
            className="posts-load-more-button"
            onClick={() => loadPosts(page + 1, true)}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load more posts'}
          </button>
        </div>
      )}
    </section>
  );
}
