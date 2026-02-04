import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/\\btext-(xs|\\[([0-9]|1[0-1])px\\])/]',
          message:
            'Do not use text size smaller than 12px (text-sm). Use "text-sm" or larger for better accessibility.',
        },
        {
          selector:
            'JSXAttribute[name.name="className"] TemplateElement[value.raw=/\\btext-(xs|\\[([0-9]|1[0-1])px\\])/]',
          message:
            'Do not use text size smaller than 12px (text-sm). Use "text-sm" or larger for better accessibility.',
        },
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/\\bfont-(bold|black|extrablack|extrabold)\\b/]',
          message:
            'Do not use heavy font weights (font-bold, font-black, etc.). Use "font-semibold" or "font-medium" instead.',
        },
        {
          selector:
            'JSXAttribute[name.name="className"] TemplateElement[value.raw=/\\bfont-(bold|black|extrablack|extrabold)\\b/]',
          message:
            'Do not use heavy font weights (font-bold, font-black, etc.). Use "font-semibold" or "font-medium" instead.',
        },
      ],
    },
  },
]);

export default eslintConfig;
