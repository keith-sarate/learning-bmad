import { useRef } from 'react';
import type { CardColor } from '../../types/types';
import './ColorPicker.css';

const COLORS: CardColor[] = ['yellow', 'pink', 'blue', 'green', 'orange', 'purple'];

interface ColorPickerProps {
  onColorSelect: (color: CardColor) => void;
}

function ColorPicker({ onColorSelect }: ColorPickerProps) {
  const swatchRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleSwatchKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      swatchRefs.current[(index + 1) % COLORS.length]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      swatchRefs.current[(index - 1 + COLORS.length) % COLORS.length]?.focus();
    }
  }

  return (
    <div className="color-picker" role="menu" aria-label="Choose card color">
      {COLORS.map((color, index) => (
        <button
          key={color}
          ref={(el) => { swatchRefs.current[index] = el; }}
          className="color-swatch"
          style={{ backgroundColor: `var(--color-card-${color})` }}
          onClick={() => onColorSelect(color)}
          onKeyDown={(e) => handleSwatchKeyDown(e, index)}
          aria-label={`Create ${color} card`}
          role="menuitem"
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}

export default ColorPicker;
