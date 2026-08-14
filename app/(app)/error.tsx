"use client";

export default function AppError({
  reset,
}: {
  reset: () => void;
}) {
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
          border:
            "1px solid rgba(248,113,113,0.22)",
          background:
            "rgba(127,29,29,0.12)",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#fca5a5",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Something went wrong
        </p>

        <h1
          style={{
            margin: "10px 0 0",
            fontSize:
              "clamp(30px, 7vw, 44px)",
            lineHeight: 1.1,
          }}
        >
          We couldn’t load this part of AITFM.
        </h1>

        <p
          style={{
            margin: "14px 0 0",
            color: "var(--muted)",
            lineHeight: 1.7,
          }}
        >
          Your account and saved progress are not affected.
          Try loading this section again.
        </p>

        <button
          type="button"
          onClick={reset}
          className="btn btn-primary"
          style={{
            marginTop: 20,
          }}
        >
          Try Again
        </button>
      </div>
    </section>
  );
}