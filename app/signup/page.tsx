import Link from "next/link";
import { signUp } from "../auth/actions";

type SignupPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

export default async function SignupPage({
  searchParams,
}: SignupPageProps) {
  const params = await searchParams;

  const message = params.message;
  const error = params.error;

  if (message) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <Link href="/" style={brandStyle}>
            AI Tools for Millions
          </Link>

          <div style={successCardStyle}>
            <div style={successIconStyle}>
              ✓
            </div>

            <p style={successEyebrowStyle}>
              Account Created
            </p>

            <h1 style={successTitleStyle}>
              Check your email to verify your account.
            </h1>

            <p style={bodyTextStyle}>
              We sent a verification link to the email
              address you used to create your AITFM
              account.
            </p>

            <div style={instructionBoxStyle}>
              <p style={instructionTitleStyle}>
                What to do next
              </p>

              <p style={instructionTextStyle}>
                1. Open your email inbox.
                <br />
                2. Look for the verification email from
                AITFM.
                <br />
                3. Click the verification link inside
                that email.
                <br />
                4. You&apos;ll be returned to AITFM to
                continue setting up your account.
              </p>
            </div>

            <p style={helperTextStyle}>
              Don&apos;t see the email? Check your Spam,
              Junk, or Promotions folder. Email delivery
              can sometimes take a few minutes.
            </p>

            <Link
              href="/login"
              style={secondaryButtonStyle}
            >
              Already verified? Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div
          style={{
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <Link href="/" style={brandStyle}>
            AI Tools for Millions
          </Link>

          <p style={brandDescriptionStyle}>
            Create your free account and start putting
            AI to practical use.
          </p>
        </div>

        <form
          action={signUp}
          style={formCardStyle}
        >
          <div>
            <p style={blueEyebrowStyle}>
              Get Started
            </p>

            <h1 style={formTitleStyle}>
              Create your account
            </h1>

            <p style={formDescriptionStyle}>
              Your free membership gives you a place to
              learn, discover tools, explore
              opportunities, and begin building with AI.
            </p>
          </div>

          {error ? (
            <div style={errorBoxStyle}>
              <p
                style={{
                  margin: 0,
                  color: "#fecaca",
                  fontWeight: 700,
                  lineHeight: 1.6,
                }}
              >
                {error}
              </p>
            </div>
          ) : null}

          <label style={fieldStyle}>
            <span style={fieldLabelStyle}>
              Display Name
            </span>

            <input
              name="displayName"
              type="text"
              placeholder="Your name"
              required
              autoComplete="name"
              style={inputStyle}
            />
          </label>

          <label style={fieldStyle}>
            <span style={fieldLabelStyle}>
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

          <label style={fieldStyle}>
            <span style={fieldLabelStyle}>
              Password
            </span>

            <input
              name="password"
              type="password"
              placeholder="Create a password"
              required
              autoComplete="new-password"
              style={inputStyle}
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            Create Free Account
          </button>

          <p style={bottomTextStyle}>
            Already have an account?{" "}
            <Link href="/login" style={textLinkStyle}>
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "24px",
  background: "#020617",
  color: "#ffffff",
};

const containerStyle = {
  width: "100%",
  maxWidth: 440,
};

const brandStyle = {
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 22,
};

const brandDescriptionStyle = {
  margin: "10px 0 0",
  color: "rgba(255,255,255,0.55)",
  lineHeight: 1.6,
};

const formCardStyle = {
  display: "grid",
  gap: 16,
  padding: "clamp(24px, 6vw, 32px)",
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.035)",
};

const blueEyebrowStyle = {
  margin: 0,
  color: "#60a5fa",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
};

const formTitleStyle = {
  margin: "8px 0 0",
  fontSize: "clamp(32px, 8vw, 42px)",
  lineHeight: 1.05,
};

const formDescriptionStyle = {
  margin: "10px 0 0",
  color: "rgba(255,255,255,0.58)",
  lineHeight: 1.6,
  fontSize: 14,
};

const fieldStyle = {
  display: "grid",
  gap: 7,
};

const fieldLabelStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#dbeafe",
};

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

const errorBoxStyle = {
  padding: 14,
  borderRadius: 12,
  border: "1px solid rgba(248,113,113,0.22)",
  background: "rgba(127,29,29,0.12)",
};

const bottomTextStyle = {
  margin: 0,
  textAlign: "center" as const,
  color: "rgba(255,255,255,0.58)",
  fontSize: 14,
};

const textLinkStyle = {
  color: "#93c5fd",
  textDecoration: "none",
  fontWeight: 800,
};

const successCardStyle = {
  marginTop: 24,
  padding: "clamp(26px, 6vw, 36px)",
  borderRadius: 22,
  border: "1px solid rgba(34,197,94,0.24)",
  background:
    "linear-gradient(180deg, rgba(34,197,94,0.07), rgba(255,255,255,0.025))",
};

const successIconStyle = {
  width: 54,
  height: 54,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.24)",
  color: "#bbf7d0",
  fontSize: 26,
  fontWeight: 900,
  marginBottom: 18,
};

const successEyebrowStyle = {
  margin: 0,
  color: "#86efac",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
};

const successTitleStyle = {
  margin: "8px 0 0",
  fontSize: "clamp(29px, 7vw, 38px)",
  lineHeight: 1.1,
};

const bodyTextStyle = {
  margin: "14px 0 0",
  color: "rgba(255,255,255,0.68)",
  lineHeight: 1.7,
};

const instructionBoxStyle = {
  marginTop: 20,
  padding: 18,
  borderRadius: 14,
  border: "1px solid rgba(96,165,250,0.14)",
  background: "rgba(37,99,235,0.05)",
};

const instructionTitleStyle = {
  margin: 0,
  color: "#bfdbfe",
  fontWeight: 800,
};

const instructionTextStyle = {
  margin: "9px 0 0",
  color: "rgba(255,255,255,0.7)",
  lineHeight: 1.8,
  fontSize: 14,
};

const helperTextStyle = {
  margin: "18px 0 0",
  color: "rgba(255,255,255,0.5)",
  lineHeight: 1.65,
  fontSize: 13,
};

const secondaryButtonStyle = {
  display: "flex",
  justifyContent: "center",
  marginTop: 20,
  padding: "11px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
};