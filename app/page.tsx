import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#f5f5f0",
        fontFamily: "sans-serif",
        gap: "1.5rem",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: "700" }}>Welcome</h1>
      <p style={{ color: "rgba(245,245,240,0.5)" }}>
        A scalable REST API platform
      </p>
      <Link
        href="/login"
        style={{
          background: "#fbbf24",
          color: "#0a0a0a",
          padding: "0.75rem 2rem",
          fontWeight: "700",
          textDecoration: "none",
          fontSize: "0.9rem",
          letterSpacing: "0.05em",
        }}
      >
        Login
      </Link>
    </main>
  );
}
