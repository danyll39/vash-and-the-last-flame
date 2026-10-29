import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from '../src/App.jsx'
import TitleScreen from '../src/components/ui/TitleScreen.jsx'

describe('TitleScreen', () => {
  it('shows the game title', () => {
    render(<TitleScreen onStart={() => {}} />)
    expect(
      screen.getByRole('heading', { name: 'Lanternhold' }),
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

describe('App', () => {
  it('leaves the title screen when Start is clicked', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(
      screen.queryByRole('heading', { name: 'Lanternhold' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/Milestone 1/)).toBeInTheDocument()
  })
})
