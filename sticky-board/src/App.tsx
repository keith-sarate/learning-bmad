import './App.css';
import Board from './components/Board/Board';
import { BoardProvider } from './context/BoardContext';

function App() {
  return (
    <div className="app">
      <BoardProvider>
        <Board />
      </BoardProvider>
    </div>
  );
}

export default App;
