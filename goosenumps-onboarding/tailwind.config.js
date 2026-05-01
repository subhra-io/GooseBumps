/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#9d4300',
        'primary-container': '#f97316',
        'on-primary': '#ffffff',
        'on-primary-container': '#582200',
        surface: '#f8f9ff',
        'surface-dim': '#cbdbf5',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#584237',
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
        outline: '#8c7164',
        'outline-variant': '#e0c0b1',
        secondary: '#565e74',
        'secondary-container': '#dae2fd',
        tertiary: '#bf0715',
        'tertiary-container': '#ff6a5e',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        sidebar: '#0F172A',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      fontSize: {
        'stats-number': ['28px', { lineHeight: '32px', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
}
