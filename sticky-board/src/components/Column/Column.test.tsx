import { render, screen } from '@testing-library/react';
import Column from './Column';

describe('Column', () => {
  it('renders column heading with given title', () => {
    render(<Column id="todo" title="To Do" emptyStateText="Your tasks go here" />);
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
  });

  it('shows empty state text when no children', () => {
    render(<Column id="todo" title="To Do" emptyStateText="Your tasks go here" />);
    expect(screen.getByText('Your tasks go here')).toBeInTheDocument();
  });

  it('hides empty state when children are provided', () => {
    render(
      <Column id="todo" title="To Do" emptyStateText="Your tasks go here">
        <div>A card</div>
      </Column>
    );
    expect(screen.queryByText('Your tasks go here')).not.toBeInTheDocument();
  });
});
