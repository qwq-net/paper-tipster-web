import type React from 'react';

export function preventEnterSubmit(e: React.KeyboardEvent<HTMLFormElement>) {
  if (e.key === 'Enter' && e.target instanceof HTMLInputElement && e.target.type !== 'submit') {
    e.preventDefault();
  }
}

export function getPasswordManagerIgnoreAttributes(ignore: boolean): React.InputHTMLAttributes<HTMLInputElement> {
  if (!ignore) return {};

  return {
    'data-1p-ignore': 'true',
    'data-lpignore': 'true',
    'data-protonpass-ignore': 'true',
    autoComplete: 'off',
  } as React.InputHTMLAttributes<HTMLInputElement>;
}
