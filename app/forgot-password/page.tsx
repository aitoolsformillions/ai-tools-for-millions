import { requestPasswordReset } from "../auth/actions";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <form
        action={requestPasswordReset}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-gray-700 bg-gray-950 p-8"
      >
        <h1 className="text-3xl font-bold">
          Reset Password
        </h1>

        <p className="text-gray-400">
          Enter your email and we'll send you a password reset link.
        </p>

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded bg-gray-900 p-3"
        />

        <button
          type="submit"
          className="rounded bg-blue-600 p-3 font-semibold"
        >
          Send Reset Link
        </button>
      </form>
    </main>
  );
}