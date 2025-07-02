module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'background-main': '#1a202c', // gray-900
        'background-secondary': '#2d3748', // gray-800
        'background-tertiary': '#374151', // gray-700
        // Text
        'text-main': '#f7fafc', // gray-100
        'text-secondary': '#a0aec0', // gray-400
        'text-accent': '#a78bfa', // purple-400
        'text-blue': '#bfdbfe', // blue-200
        'text-green': '#4ade80', // green-400
        'text-red': '#f87171', // red-400
        'text-white': '#ffffff',
        // Accent/Buttons
        'accent-blue': '#2563eb', // blue-600
        'accent-blue-dark': '#1d4ed8', // blue-700
        'accent-green': '#4ade80', // green-400
        'accent-green-dark': '#22c55e', // green-500
        // Gradients (for reference)
        'gradient-green-from': '#4ade80',
        'gradient-green-to': '#22c55e',
        // Borders
        'border-main': '#374151', // gray-700
        'border-blue': '#1d4ed8', // blue-700
      },
      fontFamily: {
        // Add your preferred font stack here
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}; 