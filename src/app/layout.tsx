import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SetupLayout } from '@/components/setup-layout';
import { isSetupComplete } from './actions';
import { Header } from '@/components/header';

export const metadata: Metadata = {
  title: 'Job.Hunt',
  description: 'AI-Powered Job Search Platform',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const setupComplete = await isSetupComplete();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <SetupLayout setupComplete={setupComplete}>
          {setupComplete && <Header />}
          <main className="container py-8">
            {children}
          </main>
        </SetupLayout>
        <Toaster />
      </body>
    </html>
  );
}
