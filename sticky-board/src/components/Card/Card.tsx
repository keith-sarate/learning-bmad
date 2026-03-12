import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card as CardType } from '../../types/types';
import { useBoardContext } from '../../context/BoardContext';
import './Card.css';

interface CardProps {
  card: CardType;
  isDone?: boolean;
}

function Card({ card, isDone }: CardProps) {
  const { dispatch } = useBoardContext();
  const [editingField, setEditingField] = useState<'title' | 'description' | null>(null);
  const originalValueRef = useRef<string>('');
  const isEscapedRef = useRef(false);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const dragStyle: React.CSSProperties = {
    transform: isDragging
      ? `${CSS.Transform.toString(transform)} rotate(var(--card-drag-tilt-angle))`
      : CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (editingField === 'title' && titleRef.current) {
      titleRef.current.textContent = card.title;
      titleRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(titleRef.current);
      range.collapse(false); // cursor at end
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    if (editingField === 'description' && descRef.current) {
      descRef.current.textContent = card.description;
      descRef.current.focus();
    }
  }, [editingField]); // intentionally omit card.title/description — only run on field switch

  function handleTitleClick() {
    if (editingField) return;
    originalValueRef.current = card.title;
    isEscapedRef.current = false;
    setEditingField('title');
  }

  function handleDescriptionClick() {
    if (editingField) return;
    originalValueRef.current = card.description;
    isEscapedRef.current = false;
    setEditingField('description');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>, field: 'title' | 'description') {
    if (e.key === 'Escape') {
      isEscapedRef.current = true;
      e.currentTarget.textContent = originalValueRef.current;
      e.currentTarget.blur();
    } else if (e.key === 'Enter' && field === 'title') {
      e.preventDefault(); // prevent <br> insertion in contenteditable
      e.currentTarget.blur();
    }
    // Enter in description field: allow default browser behavior (newline)
  }

  function handleBlur(e: React.FocusEvent<HTMLElement>, field: 'title' | 'description') {
    if (isEscapedRef.current) {
      isEscapedRef.current = false;
      setEditingField(null);
      return;
    }
    const newValue = (e.currentTarget.textContent ?? '').trim();
    if (field === 'title') {
      if (newValue) {
        dispatch({ type: 'EDIT_CARD', payload: { cardId: card.id, title: newValue } });
      }
      // Empty title: do NOT dispatch — revert silently; state still holds old title
    } else {
      // Description: empty string is a valid value (user clearing description)
      dispatch({ type: 'EDIT_CARD', payload: { cardId: card.id, description: newValue } });
    }
    setEditingField(null);
  }

  const isEditingTitle = editingField === 'title';
  const isEditingDesc = editingField === 'description';

  return (
    <div
      ref={setNodeRef}
      className={`card${isDone ? ' is-done' : ''}${isDragging ? ' is-dragging' : ''}`}
      style={{
        backgroundColor: `var(--color-card-${card.color})`,
        ...dragStyle,
      }}
      data-card-id={card.id}
      {...attributes}
      {...(editingField === null ? listeners : {})}
    >
      <p
        ref={titleRef}
        className={`card-title${isEditingTitle ? ' is-editing' : ''}`}
        contentEditable={isEditingTitle || undefined}
        suppressContentEditableWarning={true}
        onClick={handleTitleClick}
        onBlur={isEditingTitle ? (e) => handleBlur(e, 'title') : undefined}
        onKeyDown={isEditingTitle ? (e) => handleKeyDown(e, 'title') : undefined}
      >
        {!isEditingTitle ? card.title : null}
      </p>
      <p
        ref={descRef}
        className={`card-description${isEditingDesc ? ' is-editing' : ''}`}
        contentEditable={isEditingDesc || undefined}
        suppressContentEditableWarning={true}
        data-placeholder="Add a description..."
        onClick={handleDescriptionClick}
        onBlur={isEditingDesc ? (e) => handleBlur(e, 'description') : undefined}
        onKeyDown={isEditingDesc ? (e) => handleKeyDown(e, 'description') : undefined}
      >
        {!isEditingDesc ? card.description : null}
      </p>
    </div>
  );
}

export default Card;
