// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        vhs: ['"Press Start 2P"', 'monospace'],
        pretendard: ['Pretendard', 'sans-serif']
      },
    },
  },
  plugins: [],
}