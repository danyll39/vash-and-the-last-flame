import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App.jsx'

async function startGame() {
  render(<App />)
  await userEvent.click(screen.getByRole('button', { name: 'Start' }))
}

function playerPosition() {
  const player = screen.getByTestId('player')
  return { x: Number(player.dataset.x), y: Number(player.dataset.y) }
}

// The map adds ~1,000 nodes, and getByRole is slow on a DOM that big in
// jsdom, so these tests query by text and test id instead.
describe('App', () => {
  it('Start opens the village map', async () => {
    await startGame()
    expect(screen.queryByText('Last Flame')).not.toBeInTheDocument()
    expect(screen.getByText('Candlebrook')).toBeInTheDocument()
    expect(screen.getByTestId('tile-grid').children).toHaveLength(20 * 15)
    expect(playerPosition()).toEqual({ x: 10, y: 11 })
  })

  it('arrow keys and WASD move the player', async () => {
    await startGame()
    await userEvent.keyboard('{ArrowUp}')
    expect(playerPosition()).toEqual({ x: 10, y: 10 })
    await userEvent.keyboard('d')
    expect(playerPosition()).toEqual({ x: 11, y: 10 })
  })

  it('walls stop the player', async () => {
    await startGame()
    // Walk down to the bottom row of grass, then try to go further.
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
    expect(playerPosition()).toEqual({ x: 10, y: 13 })
    expect(screen.getByTestId('player').dataset.facing).toBe('down')
  })

  it('Escape returns to the title screen', async () => {
    await startGame()
    await userEvent.keyboard('{Escape}')
    expect(
      screen.getByRole('heading', { name: 'Vash and the Last Flame' }),
    ).toBeInTheDocument()
  })
})
