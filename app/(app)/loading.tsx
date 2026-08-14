export default function AppLoading() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 130,
            height: 12,
            borderRadius: 999,
            background:
              "rgba(255,255,255,0.08)",
            marginBottom: 14,
          }}
        />

        <div
          style={{
            width: "min(620px, 88%)",
            height: 48,
            borderRadius: 14,
            background:
              "rgba(255,255,255,0.07)",
          }}
        />

        <div
          style={{
            width: "min(760px, 96%)",
            height: 18,
            borderRadius: 999,
            background:
              "rgba(255,255,255,0.05)",
            marginTop: 16,
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 16,
        }}
      >
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            style={{
              minHeight: 220,
              borderRadius: 20,
              border:
                "1px solid rgba(255,255,255,0.06)",
              background:
                "rgba(255,255,255,0.025)",
              padding: 22,
            }}
          >
            <div
              style={{
                width: 84,
                height: 10,
                borderRadius: 999,
                background:
                  "rgba(255,255,255,0.07)",
              }}
            />

            <div
              style={{
                width: "80%",
                height: 28,
                borderRadius: 10,
                background:
                  "rgba(255,255,255,0.08)",
                marginTop: 18,
              }}
            />

            <div
              style={{
                width: "100%",
                height: 14,
                borderRadius: 999,
                background:
                  "rgba(255,255,255,0.05)",
                marginTop: 18,
              }}
            />

            <div
              style={{
                width: "88%",
                height: 14,
                borderRadius: 999,
                background:
                  "rgba(255,255,255,0.05)",
                marginTop: 10,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}