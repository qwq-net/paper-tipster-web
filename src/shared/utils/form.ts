import React from 'react';

export function getPasswordManagerIgnoreAttributes(ignore: boolean): React.InputHTMLAttributes<HTMLInputElement> {
  if (!ignore) return {};

  return {
    'data-1p-ignore': 'true',
    'data-lpignore': 'true',
    'data-protonpass-ignore': 'true',
    autoComplete: 'off',
  } as React.InputHTMLAttributes<HTMLInputElement>;
}
