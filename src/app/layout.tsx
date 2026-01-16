import { Outfit, IBM_Plex_Mono, Poppins } from 'next/font/google';
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
  variable: "--font-outfit"
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins'
})

const mono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono'
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${poppins.className} ${mono.variable} dark:bg-gray-900`}>
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
