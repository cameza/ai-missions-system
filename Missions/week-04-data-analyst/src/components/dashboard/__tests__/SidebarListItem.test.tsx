import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SidebarListItem } from '../SidebarListItem'

describe('SidebarListItem', () => {
  const mockProps = {
    rank: 1,
    playerName: 'Kylian Mbappé',
    fromClub: 'Paris Saint-Germain',
    toClub: 'Real Madrid',
    transferValue: '€180M',
    onClick: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders transfer information correctly', () => {
    render(<SidebarListItem {...mockProps} />)
    
    // Check rank number
    expect(screen.getByText('01')).toBeInTheDocument()
    
    // Check player name
    expect(screen.getByText('Kylian Mbappé')).toBeInTheDocument()
    
    // Check transfer route
    expect(screen.getByText('Paris Saint-Germain')).toBeInTheDocument()
    expect(screen.getByText('Real Madrid')).toBeInTheDocument()
    
    // Check transfer value
    expect(screen.getByText('€180M')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<SidebarListItem {...mockProps} />)
    
    const listItem = screen.getByRole('listitem')
    expect(listItem).toHaveAttribute(
      'aria-label',
      'Rank 1: Kylian Mbappé from Paris Saint-Germain to Real Madrid for €180M'
    )
    expect(listItem).toHaveAttribute('tabIndex', '0')
  })

  it('calls onClick when clicked', () => {
    render(<SidebarListItem {...mockProps} />)
    
    const listItem = screen.getByRole('listitem')
    fireEvent.click(listItem)
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1)
  })

  it('calls onClick when Enter key is pressed', () => {
    render(<SidebarListItem {...mockProps} />)
    
    const listItem = screen.getByRole('listitem')
    fireEvent.keyDown(listItem, { key: 'Enter' })
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1)
  })

  it('calls onClick when Space key is pressed', () => {
    render(<SidebarListItem {...mockProps} />)
    
    const listItem = screen.getByRole('listitem')
    fireEvent.keyDown(listItem, { key: ' ' })
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick for other keys', () => {
    render(<SidebarListItem {...mockProps} />)
    
    const listItem = screen.getByRole('listitem')
    fireEvent.keyDown(listItem, { key: 'ArrowDown' })
    
    expect(mockProps.onClick).not.toHaveBeenCalled()
  })

  it('formats rank number with leading zero', () => {
    const { rerender } = render(<SidebarListItem {...mockProps} rank={5} />)
    expect(screen.getByText('05')).toBeInTheDocument()

    rerender(<SidebarListItem {...mockProps} rank={10} />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('handles long player names with truncation', () => {
    const longNameProps = {
      ...mockProps,
      playerName: 'Very Long Player Name That Should Be Truncated',
    }
    
    render(<SidebarListItem {...longNameProps} />)
    
    const playerNameElement = screen.getByText('Very Long Player Name That Should Be Truncated')
    expect(playerNameElement).toHaveClass('truncate')
  })

  it('handles missing onClick gracefully', () => {
    const propsWithoutOnClick = { ...mockProps }
    const { onClick, ...propsWithoutOnClickHandler } = propsWithoutOnClick
    
    expect(() => {
      render(<SidebarListItem {...propsWithoutOnClickHandler} />)
    }).not.toThrow()
  })
})
