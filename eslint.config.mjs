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
  {
    plugins: {
      local: {
        rules: {
          'no-comments': {
            create(context) {
              const sourceCode = context.getSourceCode();
              return {
                Program() {
                  const comments = sourceCode.getAllComments();
                  comments.forEach((comment) => {
                    const text = comment.value.trim();
                    if (
                      !text.startsWith('@ts-expect-error') &&
                      !text.startsWith('@ts-ignore') &&
                      !text.startsWith('@ts-nocheck') &&
                      !text.startsWith('@ts-check') &&
                      !text.startsWith('eslint-disable') &&
                      !text.startsWith('eslint-enable') &&
                      !text.startsWith('eslint-env') &&
                      !text.startsWith('prettier-ignore') &&
                      !text.includes('id:')
                    ) {
                      context.report({
                        node: comment,
                        message: 'Comments are not allowed. Please remove this comment.',
                      });
                    }
                  });
                },
              };
            },
          },
        },
      },
    },
    rules: {
      'local/no-comments': 'error',
    },
  },
]);

export default eslintConfig;
