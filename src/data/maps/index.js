import { parseMap } from '../../logic/parseMap.js'
import village from './village.js'

// Parsed once at load. Add the other maps here as they're built (M2, M7).
export const MAPS = {
  village: parseMap(village),
}
