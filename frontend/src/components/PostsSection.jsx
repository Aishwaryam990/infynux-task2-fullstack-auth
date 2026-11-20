/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import './PostsSection.css';

const API = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

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

  return Number.isNaN(date.getTime())
    ? 'Just now'
    : date.toLocaleString();
}

export default function PostsSection({
  token,
  mode = 'feed',
  employee = null,
}) {
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

  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentPages, setCommentPages] = useState({});
  const [commentTotals, setCommentTotals] = useState({});

  const [editingCommentId, setEditingCommentId] = useState('');
  const [editingCommentContent, setEditingCommentContent] = useState('');

  const [expandedLikes, setExpandedLikes] = useState({});

  const isAdmin = mode === 'admin';
  const isMine = mode === 'mine';
  const canEngage = !isAdmin && Boolean(employee);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const request = async (endpoint, options = {}) => {
    const response = await fetch(`${API}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });

    return readResponse(response);
  };

  const loadPosts = useCallback(
    async (requestedPage = 1, append = false) => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        let endpoint = '/api/posts';

        if (isAdmin) {
          endpoint = '/api/admin/posts';
        } else if (isMine) {
          endpoint = '/api/posts/my';
        } else {
          endpoint = `/api/posts?page=${requestedPage}`;
        }

        const response = await fetch(`${API}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await readResponse(response);
        const nextPosts = getPostList(data);

        setPosts((previous) =>
          append ? [...previous, ...nextPosts] : nextPosts,
        );

        setPage(Number(data.page) || requestedPage);
        setTotalPages(Number(data.totalPages) || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [token, isAdmin, isMine],
  );

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

    if (!trimmed || trimmed.length > 2000) {
      setError('Post content must contain 1–2000 characters.');
      return;
    }

    setSaving(true);

    try {
      await request('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content: trimmed }),
      });

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

    if (!trimmed || trimmed.length > 2000) {
      setError('Post content must contain 1–2000 characters.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await request(`/api/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: trimmed }),
      });

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
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const endpoint = isAdmin
        ? `/api/admin/posts/${post.id}`
        : `/api/posts/${post.id}`;

      await request(endpoint, { method: 'DELETE' });

      setSuccess('Post deleted successfully.');

      await loadPosts(isMine || isAdmin ? 1 : page, false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // LIKE AND UNLIKE
  async function toggleLike(post) {
    setError('');

    try {
      await request(`/api/posts/${post.id}/like`, {
        method: post.isLiked ? 'DELETE' : 'POST',
      });

      await loadPosts(page, false);
    } catch (err) {
      setError(err.message);
    }
  }

  // LOAD COMMENTS
  async function loadComments(postId, requestedPage = 1) {
    try {
      const data = await request(
        `/api/posts/${postId}/comments?page=${requestedPage}`,
      );

      setCommentsByPost((previous) => ({
        ...previous,
        [postId]:
          requestedPage === 1
            ? data.comments
            : [...(previous[postId] || []), ...data.comments],
      }));

      setCommentPages((previous) => ({
        ...previous,
        [postId]: data.page,
      }));

      setCommentTotals((previous) => ({
        ...previous,
        [postId]: data.total,
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleComments(postId) {
    const opening = !expandedComments[postId];

    setExpandedComments((previous) => ({
      ...previous,
      [postId]: opening,
    }));

    if (opening && commentsByPost[postId] === undefined) {
      await loadComments(postId);
    }
  }

  // CREATE COMMENT
  async function createComment(postId) {
    const trimmed = (commentDrafts[postId] || '').trim();

    if (!trimmed || trimmed.length > 1000) {
      setError('Comment must contain 1–1000 characters.');
      return;
    }

    setError('');

    try {
      await request(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: trimmed }),
      });

      setCommentDrafts((previous) => ({
        ...previous,
        [postId]: '',
      }));

      await loadComments(postId, 1);
      await loadPosts(page, false);
    } catch (err) {
      setError(err.message);
    }
  }

  // EDIT COMMENT
  async function saveCommentEdit(postId, commentId) {
    const trimmed = editingCommentContent.trim();

    if (!trimmed || trimmed.length > 1000) {
      setError('Comment must contain 1–1000 characters.');
      return;
    }

    setError('');

    try {
      await request(
        `/api/posts/${postId}/comments/${commentId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ content: trimmed }),
        },
      );

      setEditingCommentId('');
      setEditingCommentContent('');

      await loadComments(postId, 1);
    } catch (err) {
      setError(err.message);
    }
  }

  // DELETE COMMENT
  async function deleteComment(postId, commentId) {
    if (!window.confirm('Delete this comment?')) return;

    setError('');

    try {
      await request(
        `/api/posts/${postId}/comments/${commentId}`,
        { method: 'DELETE' },
      );

      await loadComments(postId, 1);
      await loadPosts(page, false);
    } catch (err) {
      setError(err.message);
    }
  }

  const heading = isAdmin
    ? 'Company Posts'
    : isMine
      ? 'My Posts'
      : 'Company Feed';

  return (
    <section className="posts-section">
      <div className="posts-heading-row">
        <div>
          <span className="posts-eyebrow">COMPANYSPACE SOCIAL</span>
          <h2>{heading}</h2>
          <p>
            {isAdmin
              ? 'Review and moderate posts shared by employees in your company.'
              : isMine
                ? 'All posts you have shared with your company.'
                : 'Updates shared by employees in your company, newest first.'}
          </p>
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
            <div className="posts-avatar">
              {employee?.name?.charAt(0)?.toUpperCase() || 'Y'}
            </div>

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
            <button
              className="company-submit-button"
              type="submit"
              disabled={saving}
            >
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
          <p>
            {isAdmin
              ? 'There are no posts from your company employees yet.'
              : isMine
                ? 'Posts you publish will appear here.'
                : 'Be the first to share an update with your company.'}
          </p>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map((post) => {
            const authorName =
              post.author?.name || post.authorName || 'Company employee';

            const isOwnPost = Boolean(
              employee &&
                (post.authorId === employee.id ||
                  post.author?.id === employee.id),
            );

            const comments = commentsByPost[post.id] || [];

            return (
              <article className="social-post-card" key={post.id}>
                <div className="social-post-top">
                  <div className="posts-avatar">
                    {authorName.charAt(0).toUpperCase()}
                  </div>

                  <div className="social-post-author">
                    <strong>
                      {authorName}
                      {isOwnPost && (
                        <span className="posts-you-badge">You</span>
                      )}
                    </strong>

                    <span>
                      {formatDate(post.createdAt)}
                      {post.updatedAt &&
                      post.updatedAt !== post.createdAt
                        ? ' · edited'
                        : ''}
                    </span>
                  </div>

                  {(isAdmin || isOwnPost || isMine) && (
                    <div className="social-post-actions">
                      {!isAdmin && (isOwnPost || isMine) &&
                        editingId !== post.id && (
                          <button
                            type="button"
                            onClick={() => startEdit(post)}
                            disabled={saving}
                          >
                            Edit
                          </button>
                        )}

                      <button
                        type="button"
                        className="posts-delete-button"
                        onClick={() => deletePost(post)}
                        disabled={saving}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {editingId === post.id ? (
                  <div className="posts-edit-area">
                    <textarea
                      value={editContent}
                      onChange={(event) =>
                        setEditContent(event.target.value)
                      }
                      maxLength={2000}
                      rows={4}
                      aria-label="Edit post"
                    />

                    <div className="posts-edit-actions">
                      <span>{editContent.length}/2000 characters</span>

                      <button
                        type="button"
                        className="posts-cancel-button"
                        onClick={() => setEditingId('')}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="company-submit-button"
                        onClick={() => saveEdit(post.id)}
                        disabled={saving}
                      >
                        Save changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="social-post-content">{post.content}</p>
                )}

                {/* ENGAGEMENT COUNTS */}
                <div className="post-engagement-summary">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedLikes((previous) => ({
                        ...previous,
                        [post.id]: !previous[post.id],
                      }))
                    }
                  >
                    ❤️ {post.likeCount ?? 0} likes
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleComments(post.id)}
                  >
                    💬 {post.commentCount ?? 0} comments
                  </button>
                </div>

                {/* PEOPLE WHO LIKED */}
                {expandedLikes[post.id] && (
                  <div className="post-liked-by">
                    <strong>Liked by</strong>

                    {post.likedBy?.length ? (
                      post.likedBy.map((person) => (
                        <span key={person.id}>
                          {person.name}
                        </span>
                      ))
                    ) : (
                      <span>No likes yet.</span>
                    )}
                  </div>
                )}

                {/* LIKE AND COMMENT BUTTONS */}
                {canEngage && (
                  <div className="post-engagement-actions">
                    <button
                      type="button"
                      className={post.isLiked ? 'liked-button' : ''}
                      onClick={() => toggleLike(post)}
                    >
                      {post.isLiked ? '❤️ Liked' : '🤍 Like'}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleComments(post.id)}
                    >
                      💬 Comment
                    </button>
                  </div>
                )}

                {/* COMMENTS SECTION */}
                {canEngage && expandedComments[post.id] && (
                  <div className="post-comments-section">
                    <h4>Comments</h4>

                    <div className="comment-composer">
                      <input
                        type="text"
                        maxLength={1000}
                        placeholder="Write a comment..."
                        value={commentDrafts[post.id] || ''}
                        onChange={(event) =>
                          setCommentDrafts((previous) => ({
                            ...previous,
                            [post.id]: event.target.value,
                          }))
                        }
                      />

                      <button
                        type="button"
                        onClick={() => createComment(post.id)}
                      >
                        Send
                      </button>
                    </div>

                    {comments.length === 0 ? (
                      <p className="no-comments">
                        No comments yet. Start the conversation!
                      </p>
                    ) : (
                      comments.map((comment) => {
                        const ownComment =
                          comment.employeeId === employee?.id ||
                          comment.employee?.id === employee?.id;

                        return (
                          <div className="post-comment" key={comment.id}>
                            <div className="comment-avatar">
                              {comment.employee?.name
                                ?.charAt(0)
                                ?.toUpperCase() || 'E'}
                            </div>

                            <div className="comment-body">
                              <div className="comment-header">
                                <strong>
                                  {comment.employee?.name || 'Employee'}
                                </strong>

                                <span>
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>

                              {editingCommentId === comment.id ? (
                                <div className="comment-edit-area">
                                  <input
                                    value={editingCommentContent}
                                    maxLength={1000}
                                    onChange={(event) =>
                                      setEditingCommentContent(
                                        event.target.value,
                                      )
                                    }
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      saveCommentEdit(
                                        post.id,
                                        comment.id,
                                      )
                                    }
                                  >
                                    Save
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingCommentId('')
                                    }
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <p>{comment.content}</p>
                              )}

                              {ownComment &&
                                editingCommentId !== comment.id && (
                                  <div className="comment-actions">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCommentId(comment.id);
                                        setEditingCommentContent(
                                          comment.content,
                                        );
                                      }}
                                    >
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteComment(
                                          post.id,
                                          comment.id,
                                        )
                                      }
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {(commentPages[post.id] || 1) <
                      Math.ceil((commentTotals[post.id] || 0) / 10) && (
                      <button
                        type="button"
                        className="load-comments-button"
                        onClick={() =>
                          loadComments(
                            post.id,
                            (commentPages[post.id] || 1) + 1,
                          )
                        }
                      >
                        Load more comments
                      </button>
                    )}
                  </div>
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