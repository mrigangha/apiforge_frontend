"use client";
import { useState, useEffect } from "react";
import { BACKEND_API } from "../lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../lib/AuthContext";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accessToken, setAccessToken } = useAuth();
  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    async function fetchUser() {
      let token = accessToken;

      if (!token) {
        const response = await fetch(`${BACKEND_API}/api/v1/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        if (!data.access_token) {
          router.push("/login");
          return;
        }
        setAccessToken(data.access_token);
        token = data.access_token;
      }

      try {
        const response = await fetch(`${BACKEND_API}/api/v1/auth/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          router.push("/login");
          return;
        }

        const data = await response.json();
        setUser(data.user ?? data);

        if (redirect && redirect !== "/") router.push(redirect);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

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
          --card-bg: rgba(20,20,20,0.9);
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
          max-width: 480px;
          padding: 3rem;
          border: 1px solid rgba(251,191,36,0.15);
          background: var(--card-bg);
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

        .avatar {
          width: 72px;
          height: 72px;
          border: 1px solid rgba(251,191,36,0.3);
          background: rgba(251,191,36,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          color: var(--gold);
          margin-bottom: 1.5rem;
        }

        h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.8rem;
          letter-spacing: 0.04em;
          line-height: 1;
          margin-bottom: 0.4rem;
        }

        .role-badge {
          display: inline-block;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #0a0a0a;
          background: var(--gold);
          padding: 0.25rem 0.6rem;
          font-weight: 700;
          margin-bottom: 2.5rem;
        }

        .divider {
          height: 1px;
          background: rgba(251,191,36,0.1);
          margin-bottom: 2rem;
        }

        .field-row {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .field-label {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(245,245,240,0.35);
          font-weight: 400;
        }

        .field-value {
          font-size: 0.95rem;
          color: var(--white);
          font-weight: 400;
          padding: 0.75rem 1rem;
          background: #141414;
          border: 1px solid var(--grey);
        }

        .btn-row {
          display: flex;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        .btn {
          flex: 1;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.85rem;
          cursor: pointer;
          border: none;
          transition: opacity 0.2s;
          text-align: center;
        }

        .btn:hover { opacity: 0.85; }
        .btn-gold { background: var(--gold); color: #0a0a0a; }
        .btn-outline { background: transparent; color: var(--white); border: 1px solid var(--grey); }

        .state-text {
          text-align: center;
          font-size: 0.85rem;
          color: rgba(245,245,240,0.3);
          padding: 2rem 0;
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

        <div className="card">
          <div className="brand">
            API<span>FORGE</span>
          </div>

          {loading && <p className="state-text">Loading profile...</p>}
          {error && (
            <p className="state-text" style={{ color: "#ef4444" }}>
              Error: {error}
            </p>
          )}

          {user && (
            <>
              <div className="avatar">
                {(user.name ?? user.email).charAt(0).toUpperCase()}
              </div>

              <h1>{user.name ?? "User"}</h1>
              <span className="role-badge">{user.role ?? "member"}</span>

              <div className="divider" />

              <div className="field-row">
                <div className="field">
                  <span className="field-label">Email</span>
                  <span className="field-value">{user.email}</span>
                </div>
                <div className="field">
                  <span className="field-label">Name</span>
                  <span className="field-value">{user.name ?? "—"}</span>
                </div>
                <div className="field">
                  <span className="field-label">Role</span>
                  <span className="field-value">{user.role ?? "—"}</span>
                </div>
              </div>

              <div className="btn-row">
                <button
                  className="btn btn-gold"
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => router.push("/login")}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        <div className="corner-deco" />
      </div>
    </>
  );
}
