import Link from "next/link";

export default function LearningPathNotFound() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: 760,
        margin: "40px auto",
      }}
    >
      <div
        style={{
          padding: "clamp(24px, 5vw, 36px)",
          borderRadius: 20,
          border: "1px solid rgba(96,165,250,0.2)",
          background: "rgba(37,99,235,0.05)",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#93c5fd",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Learning Path Not Found
        </p>

        <h1
          style={{
            margin: "10px 0 0",
            fontSize: "clamp(30px, 7vw, 44px)",
            lineHeight: 1.1,
          }}
        >
          This learning path isn&apos;t available.
        </h1>

        <p
          style={{
            margin: "14px 0 0",
            color: "var(--muted)",
            lineHeight: 1.7,
          }}
        >
          It may have been removed, renamed, or the link may
          be incorrect.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 20,
          }}
        >
          <Link
            href="/learn"
            className="btn btn-primary"
          >
            Browse Learning Paths
          </Link>

          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}