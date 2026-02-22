"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";
import { BACKEND_API } from "../lib/store";

export default function NewPost() {
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { accessToken } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(accessToken);
      const response = await fetch(`${BACKEND_API}/api/v1/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/profile?redirect=/posts/new`);
          return;
        }
        throw new Error("Failed to create post");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        }

        body { background: var(--bg); }

        .page {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
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
        }

        .card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 560px;
          padding: 3rem;
          border: 1px solid rgba(251,191,36,0.15);
          background: rgba(20,20,20,0.9);
          animation: fadeUp 0.6s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.15em;
          color: var(--gold);
          margin-bottom: 2.5rem;
          cursor: pointer;
        }

        .brand span { color: var(--white); }

        h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.8rem;
          letter-spacing: 0.04em;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 0.85rem;
          color: rgba(245,245,240,0.4);
          font-weight: 300;
          margin-bottom: 2.5rem;
        }

        .field {
          margin-bottom: 1.25rem;
        }

        label {
          display: block;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(245,245,240,0.4);
          margin-bottom: 0.5rem;
        }

        input, textarea {
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

        input:focus, textarea:focus { border-color: var(--gold); }
        input::placeholder, textarea::placeholder { color: rgba(245,245,240,0.2); }

        textarea { min-height: 200px; }

        .error-msg {
          font-size: 0.8rem;
          color: #ef4444;
          margin-bottom: 1rem;
          padding: 0.6rem 1rem;
          border: 1px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.05);
        }

        .actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        .btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.9rem 1.5rem;
          cursor: pointer;
          border: none;
          transition: opacity 0.2s;
        }

        .btn:hover { opacity: 0.8; }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-gold { background: var(--gold); color: #0a0a0a; flex: 1; }
        .btn-outline { background: transparent; color: var(--white); border: 1px solid var(--grey); }

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

        <div className="card">
          <div className="brand" onClick={() => router.push("/dashboard")}>
            API<span>FORGE</span>
          </div>

          <h1>New Post</h1>
          <p className="subtitle">Write and publish a new post</p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                placeholder="Enter post title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                placeholder="Write your post content..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>

            <div className="actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-gold" disabled={loading}>
                {loading ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </form>
        </div>

        <div className="corner-deco" />
      </div>
    </>
  );
}
