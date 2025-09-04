import "./globals.css";

// Force dynamic rendering to avoid SSG issues with React 19
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Upbot</title>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
