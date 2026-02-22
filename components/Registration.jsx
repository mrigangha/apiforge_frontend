"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BACKEND_API } from "../lib/store";
import { useAuth } from "../lib/AuthContext";
import { useEffect } from "react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { accessToken, setAccessToken } = useAuth();
  const router = useRouter();
  useEffect(() => {
    // if token already in memory, just redirect
    if (accessToken) {
      router.push("/profile");
      return;
    }

    // try refresh cookie silently
    async function tryRefresh() {
      try {
        const res = await fetch(`${BACKEND_API}/api/v1/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.access_token) {
            setAccessToken(data.access_token);
            router.push("/profile");
          }
        }
      } catch {
        // no valid refresh token, stay on login page
      }
    }

    tryRefresh();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_API}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail ?? "Registration failed");
      }

      const data = await response.json();
      if (data.access_token) setAccessToken(data.access_token);
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
          padding: 2rem 1rem;
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
          max-width: 420px;
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

        .field { margin-bottom: 1.25rem; }

        label {
          display: block;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(245,245,240,0.4);
          margin-bottom: 0.5rem;
        }

        input {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--grey);
          color: var(--white);
          padding: 0.8rem 1rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }

        input:focus { border-color: var(--gold); }
        input::placeholder { color: rgba(245,245,240,0.2); }

        .error-msg {
          font-size: 0.8rem;
          color: #ef4444;
          margin-bottom: 1.25rem;
          padding: 0.6rem 1rem;
          border: 1px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.05);
        }

        .btn-submit {
          width: 100%;
          margin-top: 1.5rem;
          background: var(--gold);
          border: none;
          color: #0a0a0a;
          padding: 0.9rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .btn-submit:hover { opacity: 0.85; }
        .btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }

        .footer-text {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.8rem;
          color: rgba(245,245,240,0.3);
        }

        .footer-text a {
          color: var(--gold);
          text-decoration: none;
          font-weight: 500;
        }

        .footer-text a:hover { text-decoration: underline; }

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
          <div className="brand">
            API<span>FORGE</span>
          </div>
          <h1>Create Account</h1>
          <p className="subtitle">Sign up to get started</p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="footer-text">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>

        <div className="corner-deco" />
      </div>
    </>
  );
}
