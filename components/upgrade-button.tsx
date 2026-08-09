"use client";

import { useState } from "react";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to start checkout.");
      }

      if (!data.url) {
        throw new Error("Stripe Checkout URL was not returned.");
      }

      window.location.href = data.url;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start checkout.";

      setError(message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        style={{
          padding: "12px 18px",
          border: 0,
          borderRadius: 12,
          background: "#2563eb",
          color: "#ffffff",
          fontWeight: 800,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Opening Checkout..." : "Upgrade to Pro — $19/month"}
      </button>

      {error ? (
        <p
          style={{
            margin: "10px 0 0",
            color: "#fca5a5",
            fontSize: 14,
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}