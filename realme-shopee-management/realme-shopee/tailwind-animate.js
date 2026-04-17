// This is a stub for tailwindcss-animate
// Install: npm install tailwindcss-animate
// Or use the CDN version in tailwind config

module.exports = function({ addUtilities, theme }: any) {
  const animateUtilities = {
    '.animate-in': {
      animationDuration: '150ms',
      animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      animationFillMode: 'both',
    },
    '.animate-out': {
      animationDuration: '150ms',
      animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      animationFillMode: 'both',
    },
    '.fade-in': {
      animationName: 'enter',
      '--tw-enter-opacity': '1',
    },
    '.fade-out': {
      animationName: 'exit',
      '--tw-exit-opacity': '0',
    },
    '.zoom-in-95': {
      '--tw-enter-scale': '.95',
    },
    '.zoom-out-95': {
      '--tw-exit-scale': '.95',
    },
    '.slide-in-from-top-2': {
      '--tw-enter-translate-y': '-0.5rem',
    },
    '.slide-in-from-bottom-2': {
      '--tw-enter-translate-y': '0.5rem',
    },
  }
  
  addUtilities(animateUtilities)
}
