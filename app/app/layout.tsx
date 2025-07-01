import { AuthProvider } from '@/context/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
