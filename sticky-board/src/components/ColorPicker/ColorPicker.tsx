import type { CardColor } from '../../types/types';
import './ColorPicker.css';

const COLORS: CardColor[] = ['yellow', 'pink', 'blue', 'green', 'orange', 'purple'];

interface ColorPickerProps {
  onColorSelect: (color: CardColor) => void;
}

function ColorPicker({ onColorSelect }: ColorPickerProps) {
  return (
    <div className="color-picker" role="menu" aria-label="Choose card color">
      {COLORS.map((color) => (
        <button
          key={color}
          className="color-swatch"
          style={{ backgroundColor: `var(--color-card-${color})` }}
          onClick={() => onColorSelect(color)}
          aria-label={`Create ${color} card`}
          role="menuitem"
        />
      ))}
    </div>
  );
}

export default ColorPicker;
