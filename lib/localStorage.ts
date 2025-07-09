export const isBrowser = typeof window != 'undefined';

export function getLocal(keyword: string) {
  if (!isBrowser) {
    return null;
  }

  try {
    const raw = localStorage.getItem(keyword);

    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setLocal(keyword: string, value: any) {
  if (!isBrowser) {
    return;
  }

  try {
    localStorage.setItem(keyword, JSON.stringify(value));
  } catch (e) {
    return;
  }
}

export function removeLocal(keyword: string) {
  if (!isBrowser) {
    return;
  }

  try {
    localStorage.removeItem(keyword);
  } catch (e) {
    return;
  }
}
