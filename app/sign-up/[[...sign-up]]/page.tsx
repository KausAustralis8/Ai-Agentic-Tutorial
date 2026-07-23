import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#05060f" }}>
      <SignUp
        fallbackRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: "#663af3",
            colorBackground: "#0b0d18",
            colorInputBackground: "rgba(186,214,247,0.06)",
            colorText: "#d1e4fa",
            colorTextSecondary: "#9da7ba",
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
          },
        }}
      />
    </main>
  );
}
