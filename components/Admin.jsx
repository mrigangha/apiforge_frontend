"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";
import { BACKEND_API } from "../lib/store";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const { accessToken } = useAuth();
  const router = useRouter();

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!accessToken) {
      router.push(`/profile?redirect=/admin/dashboard`);
      return;
    }
    fetchUsers();
  }, [accessToken]);

  async function fetchUsers() {
    try {
      const res = await fetch(`${BACKEND_API}/api/v1/admin/users`, {
        headers: authHeaders,
        credentials: "include",
      });
      if (res.status === 403) {
        router.push("/dashboard");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users ?? data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUser(id) {
    try {
      const res = await fetch(`${BACKEND_API}/api/v1/admin/users/${id}`, {
        headers: authHeaders,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setSelectedUser(data.user ?? data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function promoteUser(id) {
    if (!confirm("Promote this user to admin?")) return;
    setActionLoading("promote");
    try {
      const res = await fetch(
        `${BACKEND_API}/api/v1/admin/users/${id}/promote`,
        {
          method: "PATCH",
          headers: authHeaders,
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Failed to promote user");
      const data = await res.json();
      const updated = data.user ?? data;
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelectedUser(null);
      showToast("User promoted to admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteUser(id) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setActionLoading("delete");
    try {
      const res = await fetch(`${BACKEND_API}/api/v1/admin/users/${id}`, {
        method: "DELETE",
        headers: authHeaders,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelectedUser(null);
      showToast("User deleted");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
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

        .admin-badge {
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #0a0a0a;
          background: #ef4444;
          padding: 0.2rem 0.5rem;
          font-weight: 700;
          margin-left: 0.75rem;
          vertical-align: middle;
        }

        .topbar-right { display: flex; align-items: center; gap: 1rem; }

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
        .btn-promote { background: transparent; color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .layout {
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 320px 1fr;
          height: calc(100vh - 65px);
        }

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

        .user-count {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          color: var(--gold);
          background: rgba(251,191,36,0.1);
          padding: 0.2rem 0.5rem;
        }

        .user-item {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(251,191,36,0.06);
          cursor: pointer;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-item:hover { background: rgba(251,191,36,0.04); }
        .user-item.active { background: rgba(251,191,36,0.08); border-left: 2px solid var(--gold); }

        .user-avatar-sm {
          width: 36px;
          height: 36px;
          border: 1px solid rgba(251,191,36,0.2);
          background: rgba(251,191,36,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1rem;
          color: var(--gold);
          flex-shrink: 0;
        }

        .user-item-info { overflow: hidden; }

        .user-item-name {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--white);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-item-email {
          font-size: 0.72rem;
          color: rgba(245,245,240,0.3);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .empty-state {
          padding: 3rem 1.5rem;
          text-align: center;
          font-size: 0.8rem;
          color: rgba(245,245,240,0.2);
          letter-spacing: 0.05em;
        }

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

        .user-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(251,191,36,0.1);
        }

        .user-header-left { display: flex; align-items: center; gap: 1.25rem; }

        .avatar-lg {
          width: 64px;
          height: 64px;
          border: 1px solid rgba(251,191,36,0.3);
          background: rgba(251,191,36,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          color: var(--gold);
          flex-shrink: 0;
        }

        .user-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.2rem;
          letter-spacing: 0.04em;
          line-height: 1;
          color: var(--white);
        }

        .role-badge {
          display: inline-block;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #0a0a0a;
          background: var(--gold);
          padding: 0.2rem 0.5rem;
          font-weight: 700;
          margin-top: 0.4rem;
        }

        .user-actions { display: flex; gap: 0.6rem; flex-shrink: 0; align-items: flex-start; }

        .field-row {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .field { display: flex; flex-direction: column; gap: 0.4rem; }

        .field-label {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(245,245,240,0.35);
        }

        .field-value {
          font-size: 0.95rem;
          color: var(--white);
          padding: 0.75rem 1rem;
          background: #141414;
          border: 1px solid var(--grey);
        }

        .loading-text {
          padding: 3rem;
          text-align: center;
          font-size: 0.8rem;
          color: rgba(245,245,240,0.2);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

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

        .toast {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: #22c55e;
          color: white;
          padding: 0.6rem 1.2rem;
          font-size: 0.8rem;
          z-index: 100;
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

        <div className="topbar">
          <div className="brand">
            API<span>FORGE</span>
            <span className="admin-badge">Admin</span>
          </div>
          <div className="topbar-right">
            <button
              className="btn btn-outline"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </button>
            <button
              className="btn btn-outline"
              onClick={() => router.push("/profile")}
            >
              Profile
            </button>
          </div>
        </div>

        <div className="layout">
          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="sidebar-header">
              <span className="sidebar-title">Users</span>
              <span className="user-count">{users.length}</span>
            </div>

            {loading && <p className="loading-text">Loading...</p>}

            {!loading && users.length === 0 && (
              <p className="empty-state">No users found.</p>
            )}

            {users.map((user) => (
              <div
                key={user.id}
                className={`user-item ${selectedUser?.id === user.id ? "active" : ""}`}
                onClick={() => fetchUser(user.id)}
              >
                <div className="user-avatar-sm">
                  {(user.name ?? user.email).charAt(0).toUpperCase()}
                </div>
                <div className="user-item-info">
                  <div className="user-item-name">{user.name ?? "—"}</div>
                  <div className="user-item-email">{user.email}</div>
                </div>
              </div>
            ))}
          </div>

          {/* MAIN PANEL */}
          <div className="main">
            {!selectedUser && (
              <div className="no-selection">Select a user to view</div>
            )}

            {selectedUser && (
              <>
                <div className="user-header">
                  <div className="user-header-left">
                    <div className="avatar-lg">
                      {(selectedUser.name ?? selectedUser.email)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="user-title">
                        {selectedUser.name ?? "No Name"}
                      </div>
                      <span className="role-badge">
                        {selectedUser.role ?? "user"}
                      </span>
                    </div>
                  </div>
                  <div className="user-actions">
                    <button
                      className="btn btn-promote"
                      onClick={() => promoteUser(selectedUser.id)}
                      disabled={actionLoading === "promote"}
                    >
                      {actionLoading === "promote" ? "Promoting..." : "Promote"}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteUser(selectedUser.id)}
                      disabled={actionLoading === "delete"}
                    >
                      {actionLoading === "delete" ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <span className="field-label">ID</span>
                    <span className="field-value">#{selectedUser.id}</span>
                  </div>
                  <div className="field">
                    <span className="field-label">Name</span>
                    <span className="field-value">
                      {selectedUser.name ?? "—"}
                    </span>
                  </div>
                  <div className="field">
                    <span className="field-label">Email</span>
                    <span className="field-value">{selectedUser.email}</span>
                  </div>
                  <div className="field">
                    <span className="field-label">Role</span>
                    <span className="field-value">
                      {selectedUser.role ?? "user"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="error-bar" onClick={() => setError(null)}>
            {error} — click to dismiss
          </div>
        )}

        {toast && (
          <div
            className="toast"
            style={{
              background: toast.type === "success" ? "#22c55e" : "#ef4444",
            }}
          >
            {toast.msg}
          </div>
        )}

        <div className="corner-deco" />
      </div>
    </>
  );
}
