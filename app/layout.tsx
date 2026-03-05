import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Evo2027 Tracker',
  description: 'Track your savings and budget for 2027',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <footer className="border-t-4 border-black bg-yellow-300 px-6 py-4 flex items-center justify-between">
          <span className="font-black text-xl tracking-tight">jupi-ter</span>
          <span className="font-bold text-lg">{new Date().getFullYear()}</span>
        </footer>
      </body>
    </html>
  );
}
