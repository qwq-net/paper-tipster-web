'use client';

import { cn } from '@/shared/utils/cn';
import { getPasswordManagerIgnoreAttributes } from '@/shared/utils/form';
import React, { useCallback, useRef } from 'react';

function formatWithCommas(value: number): string {
  if (isNaN(value) || value === 0) return '0';
  return value.toLocaleString('en-US');
}

function parseNumericString(str: string): number {
  const cleaned = str.replace(/[^0-9]/g, '');
  if (cleaned === '') return 0;
  return parseInt(cleaned, 10);
}

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  allowDecimal?: boolean;
  placeholder?: string;
  name?: string;
  ignorePasswordManager?: boolean;
}

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      value,
      onChange,
      id,
      min,
      max,
      disabled,
      className,
      allowDecimal = false,
      placeholder,
      name,
      ignorePasswordManager = true,
    },
    ref
  ) => {
    const ignoreAttrs = getPasswordManagerIgnoreAttributes(ignorePasswordManager);
    const innerRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || innerRef;
    const isComposing = useRef(false);

    const [localValue, setLocalValue] = React.useState(
      allowDecimal ? (value === 0 ? '' : value.toString()) : formatWithCommas(value)
    );

    React.useEffect(() => {
      if (!isComposing.current) {
        const nextValue = allowDecimal ? (value === 0 ? '' : value.toString()) : formatWithCommas(value);
        setLocalValue(nextValue);
      }
    }, [value, allowDecimal]);

    const handleCompositionStart = useCallback(() => {
      isComposing.current = true;
    }, []);

    const handleCompositionEnd = useCallback(
      (e: React.CompositionEvent<HTMLInputElement>) => {
        isComposing.current = false;
        const targetValue = e.currentTarget.value;
        setLocalValue(targetValue);

        if (allowDecimal) {
          const num = parseFloat(targetValue.replace(/[^0-9.]/g, ''));
          onChange(isNaN(num) ? 0 : num);
        } else {
          const num = parseNumericString(targetValue);
          onChange(num);
        }
      },
      [onChange, allowDecimal]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;

        if (isComposing.current) {
          setLocalValue(raw);
          return;
        }

        if (allowDecimal) {
          const cleaned = raw.replace(/[^0-9.]/g, '');
          const parts = cleaned.split('.');
          const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
          const num = parseFloat(sanitized);
          if (isNaN(num)) {
            setLocalValue('');
            onChange(0);
          } else {
            if (max !== undefined && num > max) return;
            if (min !== undefined && num < min) return;
            setLocalValue(sanitized);
            onChange(num);
          }
          return;
        }

        const num = parseNumericString(raw);
        if (max !== undefined && num > max) return;
        if (min !== undefined && num < min) return;

        setLocalValue(formatWithCommas(num));
        onChange(num);
      },
      [onChange, min, max, allowDecimal]
    );

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      requestAnimationFrame(() => {
        e.target.select();
      });
    }, []);

    return (
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        disabled={disabled}
        placeholder={placeholder}
        name={name}
        className={cn(
          'focus:ring-primary/20 focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...ignoreAttrs}
      />
    );
  }
);
NumericInput.displayName = 'NumericInput';
