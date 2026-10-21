export const COL = {
  FAMILIES: 'families',
  WRONGS:   'wrongs',
  PROFILES: 'profiles',
  PLANS:    'plans',
} as const
import { db } from './cloudbase'
export const col = (name: keyof typeof COL) => db.collection(COL[name])
