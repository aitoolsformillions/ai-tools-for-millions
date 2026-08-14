import Link from "next/link";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function EmptyState({
  eyebrow = "Get Started",
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: EmptyStateProps) {
  return (
    <div
      style={{
        width: "100%",
        padding: "clamp(24px, 6vw, 40px)",
        borderRadius: 20,
        border: "1px solid rgba(96,165,250,0.18)",
        background:
          "linear-gradient(180deg, rgba(37,99,235,0.055), rgba(255,255,255,0.02))",
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          display: "grid",
          placeItems: "center",
          borderRadius: 16,
          background: "rgba(37,99,235,0.12)",
          border: "1px solid rgba(96,165,250,0.2)",
          color: "#93c5fd",
          fontSize: 24,
          fontWeight: 900,
          marginBottom: 18,
        }}
      >
        ✦
      </div>

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
        {eyebrow}
      </p>

      <h2
        style={{
          margin: "8px 0 0",
          maxWidth: 680,
          fontSize: "clamp(26px, 6vw, 36px)",
          lineHeight: 1.15,
          letterSpacing: "-0.025em",
          overflowWrap: "anywhere",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: "12px 0 0",
          maxWidth: 720,
          color: "var(--muted)",
          fontSize: 16,
          lineHeight: 1.7,
          overflowWrap: "anywhere",
        }}
      >
        {description}
      </p>

      {primaryHref && primaryLabel ? (
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 22,
          }}
        >
          <Link
            href={primaryHref}
            className="btn btn-primary"
          >
            {primaryLabel}
          </Link>

          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 16px",
                borderRadius: 12,
                border:
                  "1px solid rgba(255,255,255,0.14)",
                background:
                  "rgba(255,255,255,0.03)",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}