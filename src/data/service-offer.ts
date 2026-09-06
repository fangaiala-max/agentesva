export const OFFER_AMOUNTS = {diagnostic:0,workshop:300,scoped:1500,integrated:3000,support:300} as const;
export function offerPrice(key:keyof typeof OFFER_AMOUNTS,locale:'en'|'es') {
 const value=OFFER_AMOUNTS[key];if(!value)return locale==='en'?'Free':'Gratis';
 const price=locale==='en'?`€${value.toLocaleString('en-US')}`:`${value.toLocaleString('de-DE')} €`;
 return `${locale==='en'?'From':'Desde'} ${price}${key==='support'?(locale==='en'?'/month':'/mes'):''}`;
}
export const SERVICE_OFFER = {
  diagnostic: { name: 'Diagnóstico inicial', price: offerPrice('diagnostic','es') },
  workshop: { name: 'Taller de automatización', price: offerPrice('workshop','es') },
  scoped: { name: 'Implementación acotada', price: offerPrice('scoped','es'), timeline: 'De 2 a 4 semanas' },
  integrated: { name: 'Varias integraciones', price: offerPrice('integrated','es'), timeline: 'De 4 a 8 semanas' },
  support: { name: 'Soporte y optimización', price: offerPrice('support','es') },
} as const;

export const FIT_BASELINE = {
  good: ['Proceso recurrente', 'Persona responsable', 'Acceso a herramientas y casos reales', 'Resultado medible'],
  notYet: ['Proceso todavía inestable', 'Sin responsable interno', 'Sin acceso legítimo a los datos', 'Expectativa de automatizarlo todo de una vez'],
} as const;

export const PRICE_DISCLAIMER = 'Son rangos orientativos, no presupuestos cerrados.';
