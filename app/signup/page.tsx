import { signUp } from "../auth/actions";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <form
        action={signUp}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-gray-700 p-8"
      >
        <h1 className="text-3xl font-bold">Create Account</h1>
        <input
  name="displayName"
  type="text"
  placeholder="Display Name"
  required
  className="rounded bg-gray-900 p-3"
/>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded bg-gray-900 p-3"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="rounded bg-gray-900 p-3"
        />

        <button
          type="submit"
          className="rounded bg-green-600 p-3 font-semibold"
        >
          Create Account
        </button>
      </form>
    </main>
  );
}