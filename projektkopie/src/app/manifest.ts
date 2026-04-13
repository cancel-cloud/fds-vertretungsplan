import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FDS Vertretungsplan',
    short_name: 'FDS Plan',
    description: 'Vertretungsplan der Friedrich-Dessauer-Schule Limburg',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f6f4',
    theme_color: '#145f4c',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
