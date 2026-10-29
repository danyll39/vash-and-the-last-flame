import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App.jsx'
import { startBattle } from '../src/logic/combat.js'
import { createInitialState } from '../src/state/gameReducer.js'

// Start the app in the middle of a fight with one Moss Slime.
function renderBattle(playerOverrides = {}, enemyId = 'mossSlime') {
  const base = createInitialState()
  const state = {
    ...base,
    screen: 'battle',
    player: { ...base.player, ...playerOverrides },
    world: { ...base.world, mapId: 'mosswood', x: 3, y: 3 },
    battle: startBattle(enemyId, () => 0),
  }
  render(<App initialState={state} />)
}

describe('BattleScreen', () => {
  it('shows the enemy, your bars and the actions', () => {
    renderBattle()
    expect(screen.getByTestId('enemy')).toHaveTextContent('Moss Slime')
    expect(screen.getByTestId('combat-log')).toHaveTextContent(
      'A Moss Slime appears!',
    )
    const actions = screen.getByRole('navigation', { name: 'Battle actions' })
    expect(
      within(actions)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Attack', 'Skill', 'Item', 'Flee'])
    expect(screen.getByRole('button', { name: 'Attack' })).toHaveFocus()
  })

  it('Attack adds to the log and the enemy HP drops', async () => {
    renderBattle()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByTestId('combat-log')).toHaveTextContent(
      /You hit Moss Slime for \d+\./,
    )
    const meter = within(screen.getByTestId('enemy')).getByRole('meter')
    expect(Number(meter.getAttribute('aria-valuenow'))).toBeLessThan(12)
  })

  it('the Skill menu disables skills you cannot afford, and Escape goes back', async () => {
    renderBattle({ light: 2 })
    await userEvent.click(screen.getByRole('button', { name: 'Skill' }))
    expect(
      screen.getByRole('button', { name: 'Flare (2 Light)' }),
    ).toBeEnabled()
    expect(
      screen.getByRole('button', { name: 'Mend (3 Light)' }),
    ).toBeDisabled()
    // Radiance stays hidden until Shrine 2 is lit.
    expect(screen.queryByText(/Radiance/)).not.toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Attack' })).toBeInTheDocument()
  })

  it('winning shows Continue, which returns to the map', async () => {
    renderBattle({ atk: 99 })
    await userEvent.keyboard('{Enter}')
    expect(screen.getByTestId('combat-log')).toHaveTextContent('Victory!')

    // A second Enter straight away (mashing Attack) must not skip the result.
    const next = screen.getByRole('button', { name: 'Continue' })
    expect(next).toBeDisabled()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByTestId('combat-log')).toBeInTheDocument()

    await waitFor(() => expect(next).toHaveFocus())
    await userEvent.keyboard('{Enter}')
    expect(screen.getByText('Mosswood')).toBeInTheDocument()
  })

  it('Flee is disabled in boss fights', () => {
    renderBattle({}, 'thornbackBoar')
    expect(screen.getByRole('button', { name: 'Flee' })).toBeDisabled()
  })
})
