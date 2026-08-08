// Entidades JSON-LD compartidas (GEO/AEO): una sola definición de organización,
// autor y sitio, referenciada desde todas las páginas para que los motores de IA
// puedan resolver AgentesVA como entidad única.
// Al crear nuevos perfiles de marca (LinkedIn, Crunchbase, Wikidata…), añadirlos
// al array `sameAs` de `organization`.
export const SITE = 'https://agentesva.com';

export const ORG_ID = `${SITE}/#organization`;
export const FOUNDER_ID = `${SITE}/#elizabeth-salguero`;
export const PERSON_ID = `${SITE}/#fernando-angulo`;
export const WEBSITE_ID = `${SITE}/#website`;

export const organization = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'AgentesVA',
  alternateName: 'Agentes VA',
  url: SITE,
  logo: { '@type': 'ImageObject', url: `${SITE}/brand/avatar.png` },
  description: 'Automatización con inteligencia artificial y recursos prácticos en español para negocios.',
  founder: { '@id': FOUNDER_ID },
  sameAs: ['https://www.instagram.com/agentesva/'],
};

export const founder = {
  '@type': 'Person',
  '@id': FOUNDER_ID,
  name: 'Elizabeth Salguero',
  jobTitle: 'Fundadora de AgentesVA',
  worksFor: { '@id': ORG_ID },
  sameAs: ['https://www.linkedin.com/in/elizabethsalguero/'],
};

export const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Fernando Angulo',
  url: 'https://fernandoangulo.com',
  jobTitle: 'Director de estrategia y editor de AgentesVA',
  description:
    'Analista sénior de mercados y conferenciante internacional sobre IA y búsqueda, con ponencias en más de 35 países.',
  worksFor: { '@id': ORG_ID },
  sameAs: [
    'https://www.linkedin.com/in/fernandoangulo/',
    'https://twitter.com/fernandoangulo',
  ],
};

export const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: 'AgentesVA',
  url: SITE,
  inLanguage: 'es',
  publisher: { '@id': ORG_ID },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/buscar/?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export const entityGraph = {
  '@context': 'https://schema.org',
  '@graph': [organization, founder, person, website],
};

// JSON.stringify no escapa '<': un '</script>' dentro de cualquier string
// rompería el <head> de la página al servirse vía set:html. Serializar
// SIEMPRE el JSON-LD con este helper.
export const jsonLdSerialize = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, '\\u003c');
