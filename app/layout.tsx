import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Print_Flow — Logiciel de Gestion & Facturation pour Imprimeries",
  description: "Solution SaaS spécialisée pour imprimeries et ateliers de reprographie en Afrique francophone (FCFA / XAF). Devis personnalisables, BAT, Bons de commande, Factures et Acomptes.",
  keywords: [
    "logiciel gestion imprimerie",
    "facturation imprimeur FCFA",
    "suivi de production atelier reprographie",
    "gestion devis impression A4 A3",
    "validation BAT Bon à tirer",
    "logiciel imprimerie Afrique francophone",
    "gestion acomptes et impayés imprimerie"
  ],
  authors: [{ name: "Print_Flow Architecture" }],
  creator: "Print_Flow",
  publisher: "Print_Flow",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Print_Flow — Logiciel de Gestion pour Imprimeries",
    description: "Centralisez vos devis, validations BAT, bons de production et facturation d'acompte sur une seule plateforme.",
    url: "https://printflow.app",
    siteName: "Print_Flow",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/Capture d'écran Dashboard.png",
        width: 1200,
        height: 630,
        alt: "Tableau de Bord Print_Flow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Print_Flow — Logiciel de Gestion pour Imprimeries",
    description: "Centralisez vos devis, BAT, bons de commande et facturation sur une seule plateforme.",
    images: ["/Capture d'écran Dashboard.png"],
  },
  icons: {
    icon: [
      { url: "/Favicon_PrintFlow.png", type: "image/png" },
    ],
    shortcut: "/Favicon_PrintFlow.png",
    apple: "/Favicon_PrintFlow.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
    >
      <head>
        <link rel="icon" href="/Favicon_PrintFlow.png" type="image/png" />
        <link rel="shortcut icon" href="/Favicon_PrintFlow.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Favicon_PrintFlow.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300..900;1,300..900&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-bg-base text-text-main">
        {children}
      </body>
    </html>
  );
}
