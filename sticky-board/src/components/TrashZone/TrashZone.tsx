import { useDroppable } from '@dnd-kit/core';
import { useBoardContext } from '../../context/BoardContext';
import './TrashZone.css';

function TrashZone() {
  const { boardState } = useBoardContext();
  const { setNodeRef, isOver } = useDroppable({ id: 'trash' });

  if (!boardState.isDragging) return null;

  return (
    <div
      ref={setNodeRef}
      className={`trash-zone${isOver ? ' is-active' : ''}`}
      role="region"
      aria-label="Drop here to delete card"
    >
      <span className="trash-zone-icon" aria-hidden="true">🗑️</span>
      <span className="trash-zone-label">Drop to delete</span>
    </div>
  );
}

export default TrashZone;
