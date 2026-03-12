import { useBoardContext } from '../../context/BoardContext';
import './TrashZone.css';

function TrashZone() {
  const { boardState } = useBoardContext();

  if (!boardState.isDragging) return null;

  return (
    <div className="trash-zone" role="region" aria-label="Drop here to delete card">
      <span className="trash-zone-icon" aria-hidden="true">🗑️</span>
      <span className="trash-zone-label">Drop to delete</span>
    </div>
  );
}

export default TrashZone;
