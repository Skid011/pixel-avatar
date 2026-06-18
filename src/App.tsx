import { useState } from 'react';
import './App.css'; // I'll provide the CSS too

const SIZE = 16;
const COLORS = ['#000000', '#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function PixelAvatar() {
  const [grid, setGrid] = useState<string[][]>(() =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill('#ffffff'))
  );
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleCellClick = (row: number, col: number) => {
    const newGrid = [...grid];
    newGrid[row][col] = selectedColor;
    setGrid(newGrid);
  };

  return (
    <div className="container">
      <h1>Pixel Avatar Generator</h1>
      <div className="palette">
        {COLORS.map(color => (
          <button
            key={color}
            className={`color-btn ${selectedColor === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>
      <div className="grid">
        {grid.map((row, rowIdx) =>
          row.map((color, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              className="cell"
              style={{ backgroundColor: color }}
              onClick={() => handleCellClick(rowIdx, colIdx)}
            />
          ))
        )}
      </div>
    </div>
  );
}
