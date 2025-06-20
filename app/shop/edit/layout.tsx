import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Shop',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
