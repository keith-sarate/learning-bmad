import { render, screen } from '@testing-library/react';
import Card from './Card';

const mockCard = {
  id: 'test-id-123',
  title: 'My Task',
  description: '',
  color: 'yellow' as const,
  createdAt: Date.now(),
};

describe('Card', () => {
  it('renders the title correctly', () => {
    const { container } = render(<Card card={mockCard} />);
    expect(screen.getByText('My Task')).toBeInTheDocument();
    expect(container.querySelector('.card-title')).toBeInTheDocument();
  });

  it('renders no .card-description element when description is empty', () => {
    const { container } = render(<Card card={mockCard} />);
    expect(container.querySelector('.card-description')).toBeNull();
  });

  it('renders description text when description is non-empty', () => {
    const cardWithDesc = { ...mockCard, description: 'Some details' };
    render(<Card card={cardWithDesc} />);
    expect(screen.getByText('Some details')).toBeInTheDocument();
  });

  it('renders .card-description element when description is non-empty', () => {
    const cardWithDesc = { ...mockCard, description: 'Some details' };
    const { container } = render(<Card card={cardWithDesc} />);
    expect(container.querySelector('.card-description')).toBeInTheDocument();
  });

  it('has no .is-done class when isDone prop is not provided', () => {
    const { container } = render(<Card card={mockCard} />);
    expect(container.querySelector('.card')).not.toHaveClass('is-done');
  });

  it('has no .is-done class when isDone={false}', () => {
    const { container } = render(<Card card={mockCard} isDone={false} />);
    expect(container.querySelector('.card')).not.toHaveClass('is-done');
  });

  it('has .is-done class when isDone={true}', () => {
    const { container } = render(<Card card={mockCard} isDone={true} />);
    expect(container.querySelector('.card')).toHaveClass('is-done');
  });

  it('applies background color via CSS var pattern', () => {
    const { container } = render(<Card card={mockCard} />);
    expect(container.querySelector('.card')).toHaveStyle(
      'background-color: var(--color-card-yellow)'
    );
  });
});
