/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'fold': '344px', // Galaxy Z-Fold inner screen width (folded)
        'fold-open': '673px', // Galaxy Z-Fold inner screen width (unfolded)
        'tablet': '834px', // iPad and tablet optimized
      },
      colors: {
        // Automotive masculine theme colors
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98', // Main brand blue - professional automotive
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43', // Deep automotive navy
        },
        secondary: {
          50: '#f7f7f7',
          100: '#e1e1e1',
          200: '#cfcfcf',
          300: '#b1b1b1',
          400: '#9e9e9e',
          500: '#7e7e7e', // Professional gray
          600: '#626262',
          700: '#515151',
          800: '#3b3b3b',
          900: '#222222', // Almost black
        },
        accent: {
          50: '#fff8f1',
          100: '#feecdc',
          200: '#fcd9bd',
          300: '#fdba8c',
          400: '#ff8a4c',
          500: '#ff6b35', // Energetic orange for actions
          600: '#e85d2a',
          700: '#c44b1f',
          800: '#9c3a16',
          900: '#7a2e0e',
        },
        success: {
          50: '#f0fff4',
          100: '#c6f6d5',
          200: '#9ae6b4',
          300: '#68d391',
          400: '#48bb78',
          500: '#38a169', // Success green
          600: '#2f855a',
          700: '#276749',
          800: '#22543d',
          900: '#1a202c',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Warning amber
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Error red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Automotive specific colors
        metal: {
          100: '#f8f9fa',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
        chrome: {
          100: '#f1f3f4',
          200: '#dadce0',
          300: '#bdc1c6',
          400: '#9aa0a6',
          500: '#80868b',
          600: '#5f6368',
          700: '#3c4043',
          800: '#202124',
          900: '#000000',
        }
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter var', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 15px 0 rgb(0 0 0 / 0.05)',
        'medium': '0 4px 20px 0 rgb(0 0 0 / 0.08)',
        'hard': '0 8px 30px 0 rgb(0 0 0 / 0.12)',
        'automotive': '0 4px 14px 0 rgb(36 59 83 / 0.15)',
        'glow': '0 0 20px rgb(98 125 152 / 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#374151',
            maxWidth: 'none',
            hr: {
              borderColor: '#e5e7eb',
              marginTop: '2em',
              marginBottom: '2em',
            },
            'h1, h2, h3, h4': {
              color: '#111827',
              fontWeight: '600',
            },
            h1: {
              fontSize: '2.25rem',
              lineHeight: '2.5rem',
            },
            h2: {
              fontSize: '1.875rem',
              lineHeight: '2.25rem',
            },
            h3: {
              fontSize: '1.5rem',
              lineHeight: '2rem',
            },
            h4: {
              fontSize: '1.25rem',
              lineHeight: '1.75rem',
            },
            a: {
              color: '#627d98',
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: '#486581',
                textDecoration: 'underline',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    // Add line-clamp plugin for text truncation
    function({ addUtilities, addComponents, theme }) {
      addUtilities({
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
        '.line-clamp-4': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '4',
        },
      })

      addComponents({
        '.btn-primary': {
          backgroundColor: theme('colors.primary.600'),
          color: theme('colors.white'),
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.primary.700'),
            transform: 'translateY(-1px)',
            boxShadow: theme('boxShadow.automotive'),
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.secondary.100'),
          color: theme('colors.secondary.700'),
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.secondary.200'),
            transform: 'translateY(-1px)',
          },
        },
        '.btn-accent': {
          backgroundColor: theme('colors.accent.500'),
          color: theme('colors.white'),
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.accent.600'),
            transform: 'translateY(-1px)',
            boxShadow: theme('boxShadow.medium'),
          },
        },
        '.card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.6'),
          boxShadow: theme('boxShadow.soft'),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: theme('boxShadow.medium'),
            transform: 'translateY(-2px)',
          },
        },
        '.input-field': {
          width: '100%',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          border: `1px solid ${theme('colors.secondary.300')}`,
          borderRadius: theme('borderRadius.md'),
          fontSize: theme('fontSize.sm'),
          transition: 'all 0.2s ease-in-out',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.primary.500'),
            boxShadow: `0 0 0 3px ${theme('colors.primary.100')}`,
          },
        },
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(10px)',
          borderRadius: theme('borderRadius.lg'),
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
      })
    }
  ],
}