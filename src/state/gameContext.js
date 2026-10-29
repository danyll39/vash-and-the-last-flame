import { createContext } from 'react'

// Kept in its own module so fast refresh can reload GameProvider without
// creating a second context.
export const GameContext = createContext(null)
