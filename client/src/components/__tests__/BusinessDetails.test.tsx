import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { BusinessDetails } from '../BusinessDetails';
import type { Business } from '../../hooks/use-search';
import '@testing-library/jest-dom';

describe('BusinessDetails', () => {
  const mockBusiness: Business = {
    id: '1',
    name: 'Test Business',
    address: '123 Test St',
    phone: '123-456-7890',
    rating: 4.5,
    reviews: 2438,
    photos: [],
    location: { lat: 0, lng: 0 },
    reviewsList: Array.from({ length: 2438 }, (_, i) => ({
      author_name: `User ${i + 1}`,
      rating: 5,
      text: `Review ${i + 1}`,
      time: Date.now() / 1000
    }))
  };

  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  test('renders correct number of reviews per page', () => {
    render(<BusinessDetails business={mockBusiness} onClose={onClose} />);
    
    // Click on Reviews tab
    fireEvent.click(screen.getByText('Reviews'));
    
    // Should show 5 reviews per page
    const reviews = screen.getAllByText(/Review \d+/);
    expect(reviews).toHaveLength(5);
  });

  test('pagination shows correct total pages', () => {
    render(<BusinessDetails business={mockBusiness} onClose={onClose} />);
    
    // Click on Reviews tab
    fireEvent.click(screen.getByText('Reviews'));
    
    // Total pages should be ceil(2438/5) = 488
    expect(screen.getByText('Showing reviews 1 - 5 of 2438')).toBeInTheDocument();
  });

  test('can navigate between pages', () => {
    render(<BusinessDetails business={mockBusiness} onClose={onClose} />);
    
    // Click on Reviews tab
    fireEvent.click(screen.getByText('Reviews'));
    
    // Get first page reviews (1-5)
    const firstPageReviews = screen.getAllByText(/Review \d+/).map(el => el.textContent);
    expect(firstPageReviews).toEqual(['Review 1', 'Review 2', 'Review 3', 'Review 4', 'Review 5']);
    
    // Click next page button
    fireEvent.click(screen.getByLabelText('Go to next page'));
    
    // Get second page reviews (6-10)
    const secondPageReviews = screen.getAllByText(/Review \d+/).map(el => el.textContent);
    expect(secondPageReviews).toEqual(['Review 6', 'Review 7', 'Review 8', 'Review 9', 'Review 10']);
  });

  test('pagination info shows correct review range', () => {
    render(<BusinessDetails business={mockBusiness} onClose={onClose} />);
    
    // Click on Reviews tab
    fireEvent.click(screen.getByText('Reviews'));
    
    // Check first page info
    expect(screen.getByText('Showing reviews 1 - 5 of 2438')).toBeInTheDocument();
    
    // Go to second page
    fireEvent.click(screen.getByLabelText('Go to next page'));
    expect(screen.getByText('Showing reviews 6 - 10 of 2438')).toBeInTheDocument();
    
    // Go to last page
    fireEvent.click(screen.getByLabelText('Go to last page'));
    expect(screen.getByText('Showing reviews 2436 - 2438 of 2438')).toBeInTheDocument();
  });
});
