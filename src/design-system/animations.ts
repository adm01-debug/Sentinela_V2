export const animations = {
  durations: { fast: '150ms', normal: '200ms', slow: '300ms', slower: '500ms' },
  easings: { linear: 'linear', easeIn: 'cubic-bezier(0.4, 0, 1, 1)', easeOut: 'cubic-bezier(0, 0, 0.2, 1)', easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  keyframes: {
    fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
    fadeOut: { from: { opacity: 1 }, to: { opacity: 0 } },
    slideInUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
    slideInDown: { from: { opacity: 0, transform: 'translateY(-10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
    scaleIn: { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
    spin: { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
    pulse: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
    bounce: { '0%, 100%': { transform: 'translateY(-25%)' }, '50%': { transform: 'translateY(0)' } },
  },
};

export const transitions = {
  default: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  colors: 'color, background-color, border-color 200ms ease',
  transform: 'transform 200ms ease',
  opacity: 'opacity 200ms ease',
};
