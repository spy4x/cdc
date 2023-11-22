import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,svelte,ts}',
  ],
  theme: {
    extend: {
      colors: {
        'roley-pink': '#ffccff',
        'roley-cyan': '#006666',
        'roley-purple': '#cc3399',
        'roley-yellow': '#ffcc00',
        'roley-blue': '#0066cc',
        'roley-red': '#ff0033',
        'roley-orange': '#ff9900',
        'roley-green': '#66cc66',
      },
    },
  },
  plugins: [forms, typography],
};
