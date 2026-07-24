import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Print_Flow — Logiciel de Gestion pour Imprimeries',
    short_name: 'Print_Flow',
    description: 'Logiciel privé de gestion et facturation pour imprimeries et ateliers de reprographie.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F8F9FA',
    theme_color: '#00B060',
    icons: [
      {
        src: '/Favicon_PrintFlow.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
