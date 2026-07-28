// Mapa id de Item -> Stripe Payment Link, para blueprints comprados sueltos (1,99 €).
// Se rellena incrementalmente a medida que se cablean más ítems. Piloto:
// grupo "Auditoría de tu software" (sw01-sw25). El resto queda pendiente.
export const COMPRA_URLS: Record<string, string> = {
  sw01: 'https://buy.stripe.com/14A8wP3GqeXRfIWfOyfnO1P',
  sw02: 'https://buy.stripe.com/eVqfZhel42b52Wa45QfnO1Q',
  sw03: 'https://buy.stripe.com/fZu9ATb8SbLFeEScCmfnO1R',
  sw04: 'https://buy.stripe.com/14A5kD90KeXRdAOauefnO1S',
  sw05: 'https://buy.stripe.com/9B64gz7WGeXRcwKeKufnO1T',
  sw06: 'https://buy.stripe.com/9B69AT7WG1719kybyifnO1U',
  sw07: 'https://buy.stripe.com/dRm4gz4Kug1V2WaauefnO1V',
  sw08: 'https://buy.stripe.com/4gM14nfp83f97cq0TEfnO1W',
  sw09: 'https://buy.stripe.com/dRm00j6SCbLF2Wa45QfnO1X',
  sw10: 'https://buy.stripe.com/4gMdR9b8S1710O245QfnO1Y',
  sw11: 'https://buy.stripe.com/eVqdR9a4Og1VeESgSCfnO1Z',
  sw12: 'https://buy.stripe.com/9B6bJ12CmdTN0O2auefnO20',
  sw13: 'https://buy.stripe.com/14AdR95Oy02X9kyauefnO21',
  sw14: 'https://buy.stripe.com/14A28r3GqbLFfIW8m6fnO22',
  sw15: 'https://buy.stripe.com/9B628rccWbLFaoC45QfnO23',
  sw16: 'https://buy.stripe.com/dRm9AT1yi8zt68m9qafnO24',
  sw17: 'https://buy.stripe.com/00w5kDb8S2b5gN0eKufnO25',
  sw18: 'https://buy.stripe.com/28E6oH7WGbLFeEScCmfnO26',
  sw19: 'https://buy.stripe.com/5kQ5kD4KudTNdAO1XIfnO27',
  sw20: 'https://buy.stripe.com/dRmcN5fp8aHB9kyfOyfnO28',
  sw21: 'https://buy.stripe.com/aFa6oH2Cmg1V1S67i2fnO29',
  sw22: 'https://buy.stripe.com/28E00j5Oy6rl8gueKufnO2a',
  sw23: 'https://buy.stripe.com/aFa8wP2CmdTNbsG1XIfnO2b',
  sw24: 'https://buy.stripe.com/5kQ28r5OydTNeES0TEfnO2c',
  sw25: 'https://buy.stripe.com/cNicN5b8S5nh40e1XIfnO2d',
};

export function compraUrlDeItem(id: string): string | undefined {
  return COMPRA_URLS[id];
}
