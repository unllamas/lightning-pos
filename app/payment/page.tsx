import { Suspense } from 'react';

import { PaymentPage } from '@/components/payment-page';

export default function Page() {
  return (
    <Suspense>
      <PaymentPage />
    </Suspense>
  );
}
