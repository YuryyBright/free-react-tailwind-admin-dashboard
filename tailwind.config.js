// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // якщо ти на React/Vite або Next.js
  ],
  theme: {
    extend: {
      keyframes: {
        typing: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        blink: {
          '50%': { 'border-color': 'transparent' },
          '100%': { 'border-color': 'gray' },
        },
      },
      animation: {
        typing: 'typing 3s steps(40, end) forwards, blink .8s infinite',
      },
    },
  },
  plugins: [],
};
