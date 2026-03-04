export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: "#faf5ff",
      }}
    >
      <h1 style={{ fontSize: "3rem", color: "#7c3aed", marginBottom: "0.5rem" }}>
        MagicLinkKit
      </h1>
      <p style={{ fontSize: "1.25rem", color: "#6b7280", marginBottom: "2rem" }}>
        Passwordless auth for indie developers. Magic links + OTP at $9/mo.
      </p>
      <pre
        style={{
          background: "#1e1b4b",
          color: "#c4b5fd",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
          maxWidth: "600px",
          overflow: "auto",
        }}
      >{`curl -X POST https://api.magiclinkkit.com/api/magic-link/send \\
  -H "X-Api-Key: mlk_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com"}'`}</pre>
    </main>
  );
}
