/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Dynamic score colors
    'bg-teal-500', 'bg-blue-500', 'bg-rose-500',
    'text-teal-500', 'text-blue-500', 'text-rose-500',
    'ring-teal-200', 'ring-blue-200', 'ring-rose-200',
    'ring-teal-400', 'ring-blue-400', 'ring-slate-400', 'ring-emerald-400', 'ring-indigo-400',
    'bg-teal-50', 'bg-blue-50', 'bg-rose-50',
    'text-teal-600', 'text-blue-600', 'text-rose-600',
    'border-teal-200', 'border-blue-200', 'border-rose-200',
    'shadow-teal-500/20', 'shadow-blue-500/20',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        navy: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          200: '#c7d4fe',
          300: '#a4b8fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#1e2a4a',
          900: '#0f172a',
          950: '#020617',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(30, 58, 138, 0.08)',
        'glass-lg': '0 16px 48px rgba(30, 58, 138, 0.12)',
        'card': '0 2px 12px rgba(30, 58, 138, 0.06)',
        'card-hover': '0 8px 30px rgba(30, 58, 138, 0.14)',
        'glow': '0 0 40px rgba(59, 130, 246, 0.15)',
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 20px 50px -12px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-up-delay': 'fadeInUp 0.6s ease-out 0.15s forwards',
        'fade-in-up-delay-2': 'fadeInUp 0.6s ease-out 0.3s forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero': 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(239,246,255,0.6) 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
