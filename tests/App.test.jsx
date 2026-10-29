import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App.jsx'
import { SCENES } from '../src/data/scenes.js'

async function startGame({ skipIntro = true } = {}) {
  render(<App />)
  await userEvent.click(screen.getByRole('button', { name: 'Start' }))
  if (skipIntro) {
    await userEvent.keyboard(' '.repeat(SCENES.opening.length))
  }
}

function playerPosition() {
  const player = screen.getByTestId('player')
  return { x: Number(player.dataset.x), y: Number(player.dataset.y) }
}

// The map adds ~1,000 nodes, and getByRole is slow on a DOM that big in
// jsdom, so these tests query by text and test id instead.
describe('App', () => {
  it('Start opens the village with the opening scene', async () => {
    await startGame({ skipIntro: false })
    expect(screen.queryByText('Last Flame')).not.toBeInTheDocument()
    expect(screen.getByText('Candlebrook')).toBeInTheDocument()
    expect(screen.getByTestId('tile-grid').children).toHaveLength(20 * 15)
    expect(screen.getByTestId('dialogue')).toHaveTextContent(/lantern sputters/)

    // Movement is locked until the scene is over.
    await userEvent.keyboard('{ArrowUp}')
    expect(playerPosition()).toEqual({ x: 10, y: 11 })

    await userEvent.keyboard(' ')
    expect(screen.getByTestId('dialogue')).toHaveTextContent('Wick')
  })

  it('shows the HUD', async () => {
    await startGame()
    const hud = screen.getByTestId('hud')
    expect(hud).toHaveTextContent('Lv1')
    expect(hud).toHaveTextContent('HP30/30')
    expect(hud).toHaveTextContent('Light5/5')
    expect(hud).toHaveTextContent('Gold30')
  })

  it('arrow keys and WASD move the player, and walls stop them', async () => {
    await startGame()
    await userEvent.keyboard('{ArrowUp}d')
    expect(playerPosition()).toEqual({ x: 11, y: 10 })
    await userEvent.keyboard('sssss')
    expect(playerPosition()).toEqual({ x: 11, y: 13 })
  })

  it('walking out the east exit enters Mosswood', async () => {
    await startGame()
    await userEvent.keyboard('www' + 'dddddddd' + 'ww' + 'd')
    expect(screen.getByText('Mosswood')).toBeInTheDocument()
    expect(playerPosition()).toEqual({ x: 1, y: 6 })
  })

  it('Escape returns to the title screen', async () => {
    await startGame()
    await userEvent.keyboard('{Escape}')
    expect(
      screen.getByRole('heading', { name: 'Vash and the Last Flame' }),
    ).toBeInTheDocument()
  })
})
