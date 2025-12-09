import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PIN Settings',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
