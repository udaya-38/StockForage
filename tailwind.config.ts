import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        // Brand
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bcfd',
          400: '#8097fb',
          500: '#6172f5',
          600: '#4f55eb',
          700: '#4342d0',
          800: '#3737a8',
          900: '#313485',
          950: '#1e1f52',
        },
        // Dark surfaces
        dark: {
          50:  '#f8f9fc',
          100: '#f1f3f9',
          200: '#e2e8f4',
          300: '#c8d2e8',
          400: '#94a3c0',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#060c1a',
        },
        // Success
        success: {
          50:  '#f0fdf4',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        // Warning
        warning: {
          50:  '#fffbeb',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Danger
        danger: {
          50:  '#fff1f2',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        // Info / teal
        info: {
          50:  '#f0fdfa',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(248,100%,74%,0.15) 0, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.08) 0, transparent 50%)',
      },
      boxShadow: {
        'glass': '0 4px 24px -1px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05)',
        'glass-lg': '0 8px 40px -2px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06)',
        'glow': '0 0 20px rgba(97,114,245,0.35)',
        'glow-sm': '0 0 10px rgba(97,114,245,0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
