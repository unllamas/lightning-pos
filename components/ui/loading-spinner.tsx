import { LoaderCircle } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className='animate-spin rounded-full h-8 w-8'>
      <LoaderCircle className='h-8 w-8' />
    </div>
  );
}
