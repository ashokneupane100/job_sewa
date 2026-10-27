import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppShellProvider } from '@/components/providers/app-shell-provider';
import { ThreeColumnShell } from '@/components/layout/three-column-shell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Job Sewa — Powered by Room Sewa Business Jobs API',
  description: 'Verified job timeline and recruitment portal for Nepal tech, corporate, and service sectors.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const defaultSeekerId = process.env.ROOMSEWA_DEFAULT_SEEKER_ID ?? '3';
  const defaultEmployerId = process.env.ROOMSEWA_DEFAULT_EMPLOYER_ID ?? '2';

  return (
    <html
      lang="en"
      data-theme="lights-out"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppShellProvider
          defaultSeekerId={defaultSeekerId}
          defaultEmployerId={defaultEmployerId}
        >
          <ThreeColumnShell>{children}</ThreeColumnShell>
        </AppShellProvider>
      </body>
    </html>
  );
}
