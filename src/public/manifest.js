const path = require('path');

module.exports = {
  short_name: 'NOOP-2DPipes',
  name: 'NOOP-2DPipes',
  icons: [
    {
      src: path.resolve('src/public/favicon/android-chrome-192x192.png'),
      type: 'image/png',
      sizes: '192x192',
    },
    {
      src: path.resolve('src/public/favicon/android-chrome-512x512.png'),
      type: 'image/png',
      sizes: '512x512',
    },
  ],
  start_url: '.',
  display: 'standalone',
  background_color: '#212121',
  theme_color: '#212121',
};
