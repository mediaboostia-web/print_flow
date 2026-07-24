import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Print_Flow — Logiciel de Gestion pour Imprimeries',
    short_name: 'Print_Flow',
    description: 'Application de gestion & facturation pour imprimeries et ateliers de reprographie (FCFA / XAF).',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'any',
    background_color: '#090D16',
    theme_color: '#00B060',
    categories: ['business', 'productivity', 'utilities'],
    icons: [
      {
        src: '/Favicon_PrintFlow.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/Favicon_PrintFlow.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/Favicon_PrintFlow.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
