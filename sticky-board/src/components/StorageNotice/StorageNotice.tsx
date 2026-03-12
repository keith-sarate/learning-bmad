import { useBoardContext } from '../../context/BoardContext';
import './StorageNotice.css';

function StorageNotice() {
  const { storageError } = useBoardContext();

  if (storageError === null || storageError === 'CORRUPT') {
    return null;
  }

  const message =
    storageError === 'UNAVAILABLE'
      ? "Private browsing detected — your board changes won't be saved this session."
      : "Storage is full — your latest changes could not be saved. Try removing some cards.";

  return (
    <div className="storage-notice" role="status" aria-live="polite">
      {message}
    </div>
  );
}

export default StorageNotice;
