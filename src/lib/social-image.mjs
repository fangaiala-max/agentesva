import {createHash} from 'node:crypto';
export const SOCIAL_IMAGE_VERSION = 'gemini-v1';
export function socialImagePath(pathname, title) {
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '') + '/';
  const headline = title.replace(/\s*\|\s*AgentesVA\s*$/, '').trim();
  const hash = createHash('sha256').update(`${SOCIAL_IMAGE_VERSION}|${path}|${headline}`).digest('hex').slice(0,20);
  return `/social/og/${hash}.png`;
}
