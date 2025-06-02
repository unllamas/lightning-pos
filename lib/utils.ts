import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { utils } from 'lnurl-pay';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidUrl(urlString: string): boolean {
  const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  const regex = new RegExp(expression);

  return !!urlString.match(regex);
}

export const removeLightningStandard = (str: string) => {
  const lowStr: string = str.toLowerCase();

  return lowStr.startsWith('lightning://')
    ? lowStr.replace('lightning://', '')
    : lowStr.startsWith('lightning:')
    ? lowStr.replace('lightning:', '')
    : lowStr;
};

export function normalizeLNURL(lnurl: string): string {
  return isValidUrl(lnurl) ? lnurl : utils.decodeUrlOrAddress(removeLightningStandard(lnurl))!;
}
