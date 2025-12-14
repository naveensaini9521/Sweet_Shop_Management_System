import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SweetCard from '../../components/sweets/SweetCard'

describe('SweetCard', () => {
  const mockSweet = {
    id: '1',
    name: 'Chocolate Truffle',
    description: 'Delicious dark chocolate truffle',
    category: 'Chocolate',
    price: 2.99,
    quantity: 10
  }

  const mockOnPurchase = vi.fn()

  it('renders sweet information correctly', () => {
    render(<SweetCard sweet={mockSweet} onPurchase={mockOnPurchase} />)
    
    expect(screen.getByText('Chocolate Truffle')).toBeInTheDocument()
    expect(screen.getByText('$2.99')).toBeInTheDocument()
    expect(screen.getByText('10 left')).toBeInTheDocument()
    expect(screen.getByText('Chocolate')).toBeInTheDocument()
  })

  it('disables purchase button when out of stock', () => {
    const outOfStockSweet = { ...mockSweet, quantity: 0 }
    render(<SweetCard sweet={outOfStockSweet} onPurchase={mockOnPurchase} />)
    
    const button = screen.getByText('Out of Stock')
    expect(button).toBeDisabled()
  })

  it('calls onPurchase when purchase button is clicked', () => {
    render(<SweetCard sweet={mockSweet} onPurchase={mockOnPurchase} />)
    
    const button = screen.getByText('Purchase')
    fireEvent.click(button)
    
    expect(mockOnPurchase).toHaveBeenCalledWith('1')
  })
})