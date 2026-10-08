import "./globals.css";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_TITLE ?? "SmartStock",
  description: "Stock forecasts and new-site recommendations for A to Z Vending",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
