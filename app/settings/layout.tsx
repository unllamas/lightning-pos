import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
