import type { Metadata } from 'next';
import { Merriweather } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { siteConfig } from '@/config/site';

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // Add icons if you have a favicon or app icons
  // icons: {
  //   icon: "/favicon.ico",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${merriweather.variable} font-serif antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
