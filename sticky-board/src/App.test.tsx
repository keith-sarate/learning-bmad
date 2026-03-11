import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders board with three columns', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
  });
});
