import Link from "next/link";
import { requestPasswordReset } from "../auth/actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
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
            <div style={emailIconStyle}>
              ✉
            </div>

            <p style={blueEyebrowStyle}>
              Reset Email Sent
            </p>

            <h1 style={successTitleStyle}>
              Check your email for the password-reset link.
            </h1>

            <p style={bodyTextStyle}>
              We sent instructions to the email address
              you entered. Open that email and click the
              password-reset link to continue.
            </p>

            <div style={instructionBoxStyle}>
              <p style={instructionTitleStyle}>
                Important
              </p>

              <p style={instructionTextStyle}>
                If you requested more than one password
                reset, use the <strong>newest email</strong>.
                Older reset links may no longer create a
                valid recovery session.
              </p>
            </div>

            <p style={helperTextStyle}>
              If the message isn&apos;t in your inbox,
              check Spam, Junk, or Promotions. Delivery
              may take a few minutes.
            </p>

            <div style={buttonStackStyle}>
              <Link
                href="/login"
                style={secondaryButtonStyle}
              >
                Back to Sign In
              </Link>

              <Link
                href="/forgot-password"
                style={textLinkStyle}
              >
                Request another reset email
              </Link>
            </div>
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
            We&apos;ll help you securely regain access
            to your account.
          </p>
        </div>

        <form
          action={requestPasswordReset}
          style={formCardStyle}
        >
          <div>
            <p style={blueEyebrowStyle}>
              Account Recovery
            </p>

            <h1 style={formTitleStyle}>
              Reset your password
            </h1>

            <p style={formDescriptionStyle}>
              Enter the email connected to your AITFM
              account. We&apos;ll send you a secure link
              for creating a new password.
            </p>
          </div>

          {error ? (
            <div style={errorBoxStyle}>
              <p
                style={{
                  margin: 0,
                  color: "#fecaca",
                  lineHeight: 1.6,
                  fontWeight: 700,
                }}
              >
                {error}
              </p>
            </div>
          ) : null}

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

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
            }}
          >
            Send Reset Link
          </button>

          <p style={bottomTextStyle}>
            Remember your password?{" "}
            <Link href="/login" style={textLinkStyle}>
              Return to Sign In
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
  lineHeight: 1.65,
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
  border: "1px solid rgba(96,165,250,0.22)",
  background:
    "linear-gradient(180deg, rgba(37,99,235,0.07), rgba(255,255,255,0.025))",
};

const emailIconStyle = {
  width: 54,
  height: 54,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  background: "rgba(37,99,235,0.12)",
  border: "1px solid rgba(96,165,250,0.22)",
  color: "#bfdbfe",
  fontSize: 25,
  fontWeight: 900,
  marginBottom: 18,
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
  margin: "8px 0 0",
  color: "rgba(255,255,255,0.7)",
  lineHeight: 1.7,
  fontSize: 14,
};

const helperTextStyle = {
  margin: "18px 0 0",
  color: "rgba(255,255,255,0.5)",
  lineHeight: 1.65,
  fontSize: 13,
};

const buttonStackStyle = {
  display: "grid",
  gap: 12,
  marginTop: 20,
  textAlign: "center" as const,
};

const secondaryButtonStyle = {
  display: "flex",
  justifyContent: "center",
  padding: "11px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
};