export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050816',
        panel: '#0B1020',
        panel2: '#111827',
        health: '#22c55e',
        ai: '#3b82f6',
        danger: '#ef4444',
        warning: '#facc15'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(0, 0, 0, 0.28)',
        glow: '0 0 0 1px rgba(34, 197, 94, 0.22), 0 16px 44px rgba(34, 197, 94, 0.08)'
      },
      borderRadius: {
        card: '16px'
      }
    }
  },
  plugins: []
};
