import type { Config } from 'tailwindcss'

// DeepFlow brand tokens (design-system.md v1.0). Colors resolve to CSS variables
// declared in src/index.css, which flip between dark (default) and .light.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        bone: 'var(--bone)',
        'bone-dim': 'var(--bone-dim)',
        muted: 'var(--muted)',
        green: 'var(--green)',
        'green-dim': 'var(--green-dim)',
        amber: 'var(--amber)',
        'term-amber': 'var(--term-amber)',
        red: 'var(--red)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        pill: '999px',
      },
      maxWidth: { container: '1240px' },
    },
  },
  plugins: [],
} satisfies Config
