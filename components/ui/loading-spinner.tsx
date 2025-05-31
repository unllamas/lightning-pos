export function LoadingSpinner() {
  return (
    <div className='flex items-center justify-center h-screen w-full'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-black'></div>
    </div>
  );
}
