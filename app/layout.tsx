import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Prime Salvage',
  description: 'B2B Hardware Exchange Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-[#0A0A0A] text-[#F0F0F0] font-sans antialiased selection:bg-[#EAF205] selection:text-black">
        <AuthProvider>
          {children}
          <Toaster 
             theme="dark" 
             position="bottom-right" 
             toastOptions={{
               className: 'bg-[#111111] border border-[#222222] text-[#F0F0F0] font-mono rounded-sm rounded-none',
             }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
