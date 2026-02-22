"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";
import { BACKEND_API } from "../lib/store";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { accessToken } = useAuth();
  const router = useRouter();

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  useEffect(() => {
    if (!accessToken) {
      router.push(`/profile?redirect=${window.location.pathname}`);
      return;
    }
    fetchPosts();
  }, [accessToken]);

  async function fetchPosts() {
    try {
      const res = await fetch(`${BACKEND_API}/api/v1/posts`, {
        headers: authHeaders,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data.posts ?? data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPost(id) {
    try {
      const res = await fetch(`${BACKEND_API}/api/v1/posts/${id}`, {
        headers: authHeaders,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch post");
      const data = await res.json();
      const post = data.post ?? data;
      setSelectedPost(post);
      setEditForm({ title: post.title, content: post.content });
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function savePost() {
    setSaving(true);
    try {
      const res = await fetch(
        `${BACKEND_API}/api/v1/posts/${selectedPost.id}`,
        {
          method: "PUT",
          headers: authHeaders,
          credentials: "include",
          body: JSON.stringify(editForm),
        },
      );
      if (!res.ok) throw new Error("Failed to update post");
      const data = await res.json();
      const updated = data.post ?? data;
      setSelectedPost(updated);
      setEditForm({ title: updated.title, content: updated.content });
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(id) {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${BACKEND_API}/api/v1/posts/${id}`, {
        method: "DELETE",
        headers: authHeaders,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (selectedPost?.id === id) setSelectedPost(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0a0a;
          --gold: #fbbf24;
          --white: #f5f5f0;
          --grey: #3a3a3a;
          --input-bg: #141414;
          --panel-bg: rgba(20,20,20,0.9);
        }

        body { background: var(--bg); }

        .page {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'DM Sans', sans-serif;
          color: var(--white);
          position: relative;
          overflow: hidden;
        }

        .grid-overlay {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(251,191,36,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251,191,36,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        .topbar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2.5rem;
          border-bottom: 1px solid rgba(251,191,36,0.1);
          background: rgba(10,10,10,0.95);
        }

        .brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.15em;
          color: var(--gold);
        }

        .brand span { color: var(--white); }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.55rem 1.1rem;
          cursor: pointer;
          border: none;
          transition: opacity 0.2s;
        }

        .btn:hover { opacity: 0.8; }
        .btn-gold { background: var(--gold); color: #0a0a0a; }
        .btn-outline { background: transparent; color: var(--gold); border: 1px solid rgba(251,191,36,0.4); }
        .btn-danger { background: transparent; color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .layout {
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 320px 1fr;
          height: calc(100vh - 65px);
        }

        /* SIDEBAR */
        .sidebar {
          border-right: 1px solid rgba(251,191,36,0.1);
          overflow-y: auto;
          background: rgba(12,12,12,0.8);
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(251,191,36,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.1rem;
          letter-spacing: 0.1em;
          color: rgba(245,245,240,0.5);
        }

        .post-count {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          color: var(--gold);
          background: rgba(251,191,36,0.1);
          padding: 0.2rem 0.5rem;
        }

        .post-item {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(251,191,36,0.06);
          cursor: pointer;
          transition: background 0.15s;
        }

        .post-item:hover { background: rgba(251,191,36,0.04); }
        .post-item.active { background: rgba(251,191,36,0.08); border-left: 2px solid var(--gold); }

        .post-item-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--white);
          margin-bottom: 0.3rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .post-item-meta {
          font-size: 0.72rem;
          color: rgba(245,245,240,0.3);
          letter-spacing: 0.05em;
        }

        .empty-state {
          padding: 3rem 1.5rem;
          text-align: center;
          font-size: 0.8rem;
          color: rgba(245,245,240,0.2);
          letter-spacing: 0.05em;
        }

        /* MAIN PANEL */
        .main {
          overflow-y: auto;
          padding: 2.5rem 3rem;
          background: rgba(10,10,10,0.5);
        }

        .no-selection {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 0.1em;
          color: rgba(245,245,240,0.08);
        }

        .post-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(251,191,36,0.1);
        }

        .post-title-display {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.4rem;
          letter-spacing: 0.04em;
          line-height: 1;
          color: var(--white);
        }

        .post-actions { display: flex; gap: 0.6rem; flex-shrink: 0; }

        .post-content-display {
          font-size: 0.95rem;
          line-height: 1.8;
          color: rgba(245,245,240,0.7);
          white-space: pre-wrap;
        }

        /* EDIT FORM */
        .edit-form { display: flex; flex-direction: column; gap: 1.25rem; }

        .field label {
          display: block;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(245,245,240,0.35);
          margin-bottom: 0.5rem;
        }

        .field input, .field textarea {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--grey);
          color: var(--white);
          padding: 0.8rem 1rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
          resize: vertical;
        }

        .field input:focus, .field textarea:focus { border-color: var(--gold); }
        .field textarea { min-height: 240px; }

        .edit-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }

        .error-bar {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: #ef4444;
          color: white;
          padding: 0.6rem 1.2rem;
          font-size: 0.8rem;
          z-index: 100;
          cursor: pointer;
        }

        .loading-text {
          padding: 3rem;
          text-align: center;
          font-size: 0.8rem;
          color: rgba(245,245,240,0.2);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .corner-deco {
          position: fixed;
          bottom: 3rem;
          right: 3rem;
          width: 60px;
          height: 60px;
          border-right: 1px solid rgba(251,191,36,0.2);
          border-bottom: 1px solid rgba(251,191,36,0.2);
          pointer-events: none;
        }
      `}</style>

      <div className="page">
        <div className="grid-overlay" />

        {/* TOPBAR */}
        <div className="topbar">
          <div className="brand">
            API<span>FORGE</span>
          </div>
          <div className="topbar-right">
            <button
              className="btn btn-outline"
              onClick={() => router.push("/profile")}
            >
              Profile
            </button>
            <button
              className="btn btn-gold"
              onClick={() => router.push("/posts/new")}
            >
              + New Post
            </button>
          </div>
        </div>

        <div className="layout">
          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="sidebar-header">
              <span className="sidebar-title">Posts</span>
              <span className="post-count">{posts.length}</span>
            </div>

            {loading && <p className="loading-text">Loading...</p>}

            {!loading && posts.length === 0 && (
              <p className="empty-state">No posts yet.</p>
            )}

            {posts.map((post) => (
              <div
                key={post.id}
                className={`post-item ${selectedPost?.id === post.id ? "active" : ""}`}
                onClick={() => fetchPost(post.id)}
              >
                <div className="post-item-title">{post.title}</div>
                <div className="post-item-meta">#{post.id}</div>
              </div>
            ))}
          </div>

          {/* MAIN PANEL */}
          <div className="main">
            {!selectedPost && (
              <div className="no-selection">Select a post to view</div>
            )}

            {selectedPost && !editMode && (
              <>
                <div className="post-header">
                  <h1 className="post-title-display">{selectedPost.title}</h1>
                  <div className="post-actions">
                    <button
                      className="btn btn-outline"
                      onClick={() => setEditMode(true)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deletePost(selectedPost.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="post-content-display">{selectedPost.content}</p>
              </>
            )}

            {selectedPost && editMode && (
              <div className="edit-form">
                <div className="field">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label>Content</label>
                  <textarea
                    value={editForm.content}
                    onChange={(e) =>
                      setEditForm({ ...editForm, content: e.target.value })
                    }
                  />
                </div>
                <div className="edit-actions">
                  <button
                    className="btn btn-gold"
                    onClick={savePost}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="error-bar" onClick={() => setError(null)}>
            {error} — click to dismiss
          </div>
        )}

        <div className="corner-deco" />
      </div>
    </>
  );
}
