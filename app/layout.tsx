import React from 'react';

export const metadata = {
  title: '30-Day Emergency Fat Loss Tracker',
  description: 'Aggressive 4-week body recomposition protocol',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#09090b" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
