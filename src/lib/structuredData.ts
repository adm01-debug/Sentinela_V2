/**
 * JSON-LD structured data for SEO.
 * Injects WebApplication schema into the document head.
 */

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Sentinela - SecureWatch',
  description: 'Plataforma de monitoramento de atividades de funcionários e segurança corporativa.',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
  },
  featureList: [
    'Monitoramento de atividades em tempo real',
    'Rastreamento de produtividade',
    'Detecção de violações de segurança',
    'Geofencing e controle de localização',
    'Relatórios e análises detalhadas',
    'Gamificação e engajamento',
  ],
};

let injected = false;

/**
 * Inject JSON-LD structured data into document head.
 * Safe to call multiple times - only injects once.
 */
export function injectStructuredData(): void {
  if (injected || typeof document === 'undefined') return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(STRUCTURED_DATA);
  document.head.appendChild(script);

  // Also ensure essential OG tags exist
  const ogTags: Record<string, string> = {
    'og:type': 'website',
    'og:title': 'Sentinela - SecureWatch',
    'og:description': 'Plataforma de monitoramento de atividades e segurança corporativa.',
    'og:site_name': 'Sentinela',
  };

  Object.entries(ogTags).forEach(([property, content]) => {
    if (!document.querySelector(`meta[property="${property}"]`)) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
  });

  injected = true;
}
