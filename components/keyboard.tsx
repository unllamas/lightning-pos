import { Delete } from 'lucide-react';

import { IUseNumpad } from '@/hooks/use-numpad';

import { Button } from './ui/button';

const timeOut: Record<string, NodeJS.Timeout> = {};
type KeyboardProps = {
  numpadData: IUseNumpad;
  disabled?: boolean;
};

export function Keyboard({ numpadData, disabled = false }: KeyboardProps) {
  const { handleNumpad, resetAmount, deleteNumber } = numpadData;

  const handleDeleteOnMouseDown = () => (timeOut.reset = setTimeout(() => resetAmount(), 500));

  const handleDeleteOnMouseUp = () => clearTimeout(timeOut?.reset);

  return (
    <div className='flex flex-col gap-4 w-full'>
      <div className='flex gap-4 w-full'>
        <Button className='w-full' variant='outline' size='lg' onClick={() => handleNumpad('1')} disabled={disabled}>
          1
        </Button>
        <Button className='w-full' variant='outline' size='lg' onClick={() => handleNumpad('2')} disabled={disabled}>
          2
        </Button>
        <Button className='w-full' variant='outline' size='lg' onClick={() => handleNumpad('3')} disabled={disabled}>
          3
        </Button>
      </div>
      <div className='flex gap-4'>
        <Button className='w-full' variant='outline' size='lg' onClick={() => handleNumpad('4')} disabled={disabled}>
          4
        </Button>
        <Button className='w-full' variant='outline' size='lg' onClick={() => handleNumpad('5')} disabled={disabled}>
          5
        </Button>
        <Button className='w-full' variant='outline' size='lg' onClick={() => handleNumpad('6')} disabled={disabled}>
          6
        </Button>
      </div>
      <div className='flex gap-4'>
        <Button className='w-full' variant='outline' size='lg' onClick={() => handleNumpad('7')} disabled={disabled}>
          7
        </Button>
        <Button className='w-full' variant='outline' size='lg' onClick={() => handleNumpad('8')} disabled={disabled}>
          8
        </Button>
        <Button className='w-full' variant='outline' size='lg' onClick={() => handleNumpad('9')} disabled={disabled}>
          9
        </Button>
      </div>
      <div className='flex gap-4'>
        <Button className='w-full' variant='outline' size='lg' onClick={() => handleNumpad('00')} disabled={disabled}>
          00
        </Button>
        <Button className='w-full' variant='outline' size='lg' onClick={() => handleNumpad('0')} disabled={disabled}>
          0
        </Button>
        <Button
          className='w-full'
          variant='destructive'
          size='lg'
          onTouchStart={handleDeleteOnMouseDown}
          onTouchEnd={handleDeleteOnMouseUp}
          onMouseDown={handleDeleteOnMouseDown}
          onMouseUp={handleDeleteOnMouseUp}
          onClick={deleteNumber}
          disabled={disabled}
        >
          <Delete />
        </Button>
      </div>
    </div>
  );
}
