import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Arinova Dashboard",     // ← TEXT SHOWN IN TAB
  description: "Management System",
  icons: {
    icon: "/favicon.ico",
  },
};

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            {children}
            <Toaster position="top-right" />

          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
