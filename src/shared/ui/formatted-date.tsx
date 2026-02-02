'use client';

import { useSyncExternalStore } from 'react';
import { formatJST } from '../utils/date';

interface FormattedDateProps {
  date: Date | string | null | undefined;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function FormattedDate({ date, options, className }: FormattedDateProps) {
  const isCient = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  return <span className={className}>{isCient ? formatJST(date, options) : ''}</span>;
}
