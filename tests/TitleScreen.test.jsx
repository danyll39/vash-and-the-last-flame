import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import TitleScreen from '../src/components/ui/TitleScreen.jsx'

describe('TitleScreen', () => {
  it('shows the game title', () => {
    render(<TitleScreen onStart={() => {}} />)
    expect(
      screen.getByRole('heading', { name: 'Vash and the Last Flame' }),
    ).toBeInTheDocument()
  })

  it('focuses Start so Enter begins the game', async () => {
    const onStart = vi.fn()
    render(<TitleScreen onStart={onStart} />)
    expect(screen.getByRole('button', { name: 'Start' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('keeps Continue disabled until saving exists', () => {
    render(<TitleScreen onStart={() => {}} />)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })
})
