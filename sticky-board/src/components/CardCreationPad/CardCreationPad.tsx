import { useState, useRef, useEffect } from 'react';
import type { Card, CardColor } from '../../types/types';
import { useBoardContext } from '../../context/BoardContext';
import ColorPicker from '../ColorPicker/ColorPicker';
import './CardCreationPad.css';

type CreationPhase = 'idle' | 'color-picking' | 'card-creating';

function CardCreationPad() {
  const { dispatch } = useBoardContext();
  const [phase, setPhase] = useState<CreationPhase>('idle');
  const [selectedColor, setSelectedColor] = useState<CardColor>('yellow');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (phase === 'card-creating') {
      titleInputRef.current?.focus();
    }
  }, [phase]);

  function handlePadClick() {
    setPhase('color-picking');
  }

  function handleAddButtonClick() {
    setPhase('color-picking');
  }

  function handleColorSelect(color: CardColor) {
    setSelectedColor(color);
    setPhase('card-creating');
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      cancelledRef.current = true;
      setPhase('idle');
      e.currentTarget.blur();
    } else if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  }

  function handleTitleBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      setPhase('idle');
      return;
    }
    const title = e.currentTarget.value.trim();
    if (title) {
      const card: Card = {
        id: crypto.randomUUID(),
        title,
        description: '',
        color: selectedColor,
        createdAt: Date.now(),
      };
      dispatch({ type: 'ADD_CARD', payload: { card, columnId: 'todo' } });
    }
    setPhase('idle');
  }

  if (phase === 'color-picking') {
    return <ColorPicker onColorSelect={handleColorSelect} />;
  }

  if (phase === 'card-creating') {
    return (
      <div
        className="card-creation-form"
        style={{ backgroundColor: `var(--color-card-${selectedColor})` }}
      >
        <input
          ref={titleInputRef}
          className="card-creation-input"
          type="text"
          placeholder="Card title..."
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          aria-label="New card title"
        />
      </div>
    );
  }

  return (
    <div className="creation-pad-container">
      <div
        className="creation-pad"
        onClick={handlePadClick}
        role="button"
        tabIndex={0}
        aria-label="Create a new card"
        onKeyDown={(e) => e.key === 'Enter' && handlePadClick()}
      />
      <button
        className="add-card-button"
        onClick={handleAddButtonClick}
        aria-label="Add a new card"
      >
        +
      </button>
    </div>
  );
}

export default CardCreationPad;
