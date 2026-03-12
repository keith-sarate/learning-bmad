import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ColorPicker from './ColorPicker';

describe('ColorPicker', () => {
  it('renders exactly 6 swatches with correct aria-labels', () => {
    const onColorSelect = vi.fn();
    render(<ColorPicker onColorSelect={onColorSelect} />);

    const swatches = screen.getAllByRole('menuitem');
    expect(swatches).toHaveLength(6);

    expect(screen.getByLabelText('Create yellow card')).toBeInTheDocument();
    expect(screen.getByLabelText('Create pink card')).toBeInTheDocument();
    expect(screen.getByLabelText('Create blue card')).toBeInTheDocument();
    expect(screen.getByLabelText('Create green card')).toBeInTheDocument();
    expect(screen.getByLabelText('Create orange card')).toBeInTheDocument();
    expect(screen.getByLabelText('Create purple card')).toBeInTheDocument();
  });

  it('calls onColorSelect with "yellow" when yellow swatch is clicked', async () => {
    const user = userEvent.setup();
    const onColorSelect = vi.fn();
    render(<ColorPicker onColorSelect={onColorSelect} />);

    await user.click(screen.getByLabelText('Create yellow card'));

    expect(onColorSelect).toHaveBeenCalledWith('yellow');
    expect(onColorSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onColorSelect with "purple" when purple swatch is clicked', async () => {
    const user = userEvent.setup();
    const onColorSelect = vi.fn();
    render(<ColorPicker onColorSelect={onColorSelect} />);

    await user.click(screen.getByLabelText('Create purple card'));

    expect(onColorSelect).toHaveBeenCalledWith('purple');
    expect(onColorSelect).toHaveBeenCalledTimes(1);
  });

  it('ArrowRight moves focus from yellow swatch to pink swatch', () => {
    const onColorSelect = vi.fn();
    render(<ColorPicker onColorSelect={onColorSelect} />);
    const yellowSwatch = screen.getByLabelText('Create yellow card');
    const pinkSwatch = screen.getByLabelText('Create pink card');
    yellowSwatch.focus();
    fireEvent.keyDown(yellowSwatch, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(pinkSwatch);
  });

  it('ArrowLeft from yellow swatch (index 0) wraps to purple swatch (index 5)', () => {
    const onColorSelect = vi.fn();
    render(<ColorPicker onColorSelect={onColorSelect} />);
    const yellowSwatch = screen.getByLabelText('Create yellow card');
    const purpleSwatch = screen.getByLabelText('Create purple card');
    yellowSwatch.focus();
    fireEvent.keyDown(yellowSwatch, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(purpleSwatch);
  });

  it('ArrowDown moves focus from yellow swatch to pink swatch', () => {
    const onColorSelect = vi.fn();
    render(<ColorPicker onColorSelect={onColorSelect} />);
    const yellowSwatch = screen.getByLabelText('Create yellow card');
    const pinkSwatch = screen.getByLabelText('Create pink card');
    yellowSwatch.focus();
    fireEvent.keyDown(yellowSwatch, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(pinkSwatch);
  });

  it('ArrowUp from yellow swatch (index 0) wraps to purple swatch (index 5)', () => {
    const onColorSelect = vi.fn();
    render(<ColorPicker onColorSelect={onColorSelect} />);
    const yellowSwatch = screen.getByLabelText('Create yellow card');
    const purpleSwatch = screen.getByLabelText('Create purple card');
    yellowSwatch.focus();
    fireEvent.keyDown(yellowSwatch, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(purpleSwatch);
  });
});
