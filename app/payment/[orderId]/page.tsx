import { PaymentPage } from "@/components/payment-page"

interface PaymentPageProps {
  params: {
    orderId: string
  }
}

export default function Payment({ params }: PaymentPageProps) {
  return <PaymentPage orderId={params.orderId} />
}
