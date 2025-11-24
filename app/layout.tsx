import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import QueryProvider from '@/src/providers/QueryProvider';
import { OverlayStackProvider } from '@/components/ui/OverlayStackContext';
import AlarmProvider from '@/src/providers/AlarmProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Panopticon - APM Trace Analysis & Monitoring',
  description:
    'Panopticon is a comprehensive APM (Application Performance Monitoring) platform for distributed trace analysis, real-time span visualization, and system performance monitoring.',
  keywords: 'APM, trace analysis, performance monitoring, distributed tracing, span visualization',
  icons: {
    icon: '/logo/Logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <AlarmProvider>
            <OverlayStackProvider>
              <ToastContainer position="top-right" autoClose={1200} hideProgressBar={true} />
              {children}
            </OverlayStackProvider>
          </AlarmProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
