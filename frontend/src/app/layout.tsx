import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitLab AI Orchestrator",
  description: "AI-powered GitLab issue triage, fix suggestions, pipeline monitoring, and MR reviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gitlab-darker min-h-screen">{children}</body>
    </html>
  );
}
