import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Keyring OS",
  description: "The Operating System for Real Estate",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
