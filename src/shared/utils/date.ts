export const JST_TIMEZONE = 'Asia/Tokyo';

export function toJSTString(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: JST_TIMEZONE,
  })
    .format(d)
    .replace(/\//g, '-')
    .replace(/ /g, 'T')
    .slice(0, 16);
}

export function parseJSTToUTC(jstString: string | null | undefined): Date | null {
  if (!jstString) return null;

  const date = new Date(`${jstString}:00+09:00`);
  return isNaN(date.getTime()) ? null : date;
}

export function formatJST(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ja-JP', {
    ...options,
    timeZone: JST_TIMEZONE,
  }).format(d);
}
