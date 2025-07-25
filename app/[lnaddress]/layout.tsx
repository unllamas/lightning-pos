import type { Metadata } from 'next';

import { AuthProvider } from '@/context/auth';

export const metadata: Metadata = {
  title: 'Pay to...',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
