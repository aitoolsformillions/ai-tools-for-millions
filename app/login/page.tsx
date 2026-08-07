import { signIn } from "../auth/actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <form action={signIn} className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-gray-700 p-8">
        <h1 className="text-3xl font-bold">Sign In</h1>

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
          className="rounded bg-blue-600 p-3 font-semibold"
        >
          Sign In
        </button>
      </form>
    </main>
  );
}