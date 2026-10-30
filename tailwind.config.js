/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './componentes/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        verde: {
          principal: '#1F5C4D',
          hover: '#18473c',
          oscuro: '#12241F',
          claro: '#E8F2EF',
        },
        terracota: {
          DEFAULT: '#8F3F2B',
          hover: '#733222',
          claro: '#FDEEEB',
        },
        dorado: {
          DEFAULT: '#7A5C05',
          claro: '#FEF9E7',
        },
        fondo: '#EEF0EA',
      },
    },
  },
  plugins: [],
};
