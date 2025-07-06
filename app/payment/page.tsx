import { Suspense } from 'react';

import { AuthProvider } from '@/context/auth';

import { PaymentPage } from '@/components/payment-page';

export default function Page() {
  return (
    <AuthProvider>
      <Suspense>
        <PaymentPage />
      </Suspense>
    </AuthProvider>
  );
}
