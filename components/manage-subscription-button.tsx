"use client";

import { useState } from "react";

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to open subscription management."
        );
      }

      if (!data.url) {
        throw new Error("Stripe portal URL was not returned.");
      }

      window.location.href = data.url;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to open subscription management.";

      setError(message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className="btn btn-primary"
        style={{
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Opening Billing..." : "Manage Subscription"}
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