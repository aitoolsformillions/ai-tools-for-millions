import Link from "next/link";
import { signIn } from "../auth/actions";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#020617",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
        }}
      >
        <div
          style={{
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#ffffff",
              textDecoration: "none",
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            AI Tools for Millions
          </Link>

          <p
            style={{
              margin: "10px 0 0",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.6,
            }}
          >
            Sign in to continue learning, building,
            and tracking your AI progress.
          </p>
        </div>

        <form
          action={signIn}
          style={{
            display: "grid",
            gap: 16,
            padding: "clamp(24px, 6vw, 32px)",
            borderRadius: 20,
            border:
              "1px solid rgba(255,255,255,0.1)",
            background:
              "rgba(255,255,255,0.035)",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#60a5fa",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Member Sign In
            </p>

            <h1
              style={{
                margin: "8px 0 0",
                fontSize: "clamp(32px, 8vw, 42px)",
                lineHeight: 1.05,
              }}
            >
              Welcome back
            </h1>
          </div>

          <label
            style={{
              display: "grid",
              gap: 7,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#dbeafe",
              }}
            >
              Email
            </span>

            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              style={inputStyle}
            />
          </label>

          <label
            style={{
              display: "grid",
              gap: 7,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#dbeafe",
              }}
            >
              Password
            </span>

            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              style={inputStyle}
            />
          </label>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: -4,
            }}
          >
            <Link
              href="/forgot-password"
              style={{
                color: "#93c5fd",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            Sign In
          </button>

          <div
            style={{
              height: 1,
              background:
                "rgba(255,255,255,0.08)",
              margin: "4px 0",
            }}
          />

          <p
            style={{
              margin: 0,
              textAlign: "center",
              color: "rgba(255,255,255,0.58)",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            New to AITFM?{" "}
            <Link
              href="/signup"
              style={{
                color: "#93c5fd",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Create a free account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(15,23,42,0.9)",
  color: "#ffffff",
  fontSize: 15,
  outline: "none",
};