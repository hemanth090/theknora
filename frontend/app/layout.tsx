import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "KnoRa - AI Knowledge Assistant",
  description:
    "Intelligent document analysis and question answering system powered by advanced AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className="bg-neutral-0 text-neutral-700"
        style={{ backgroundColor: "#faf8f3" }}
      >
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
