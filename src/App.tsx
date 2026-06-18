import { useState, useRef, useCallback } from 'react';

const SIZE = 16;
type Grid = string[][];

const PALETTE = [
  '#f72585','#e07a5f','#f4a261','#f9c74f',
  '#90be6d','#43aa8b','#4361ee','#7209b7',
  '#ffffff','#c9c9c9','#888888','#444444',
  '#1a1a2e','#16213e','#0f3460','#000000',
];

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill('transparent'));
}

function randomGrid(): Grid {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => PALETTE[Math.floor(Math.random() * PALETTE.length)])
  );
}
export default function PixelAvatar() {
  const [grid, setGrid] = useState<Grid>(emptyGrid);
  const [color, setColor] = useState('#7209b7');
  const [tool, setTool] = useState<'draw' | 'erase'>('draw');
  const [bgColor, setBg] = useState('#0f0f1a');
  const isDrawing = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const paint = useCallback((row: number, col: number) => {
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = tool === 'erase' ? 'transparent' : color;
      return next;
    });
  }, [color, tool]);

  const getCell = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const cellSize = rect.width / SIZE;
    const col = Math.floor((e.clientX - rect.left) / cellSize);
    const row = Math.floor((e.clientY - rect.top) / cellSize);
    return { row, col };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDrawing.current = true;
    const { row, col } = getCell(e);
    paint(row, col);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing.current) return;
    const { row, col } = getCell(e);
    paint(row, col);
  };

  const handleMouseUp = () => { isDrawing.current = false; };

  const downloadPNG = () => {
    const canvas = document.createElement('canvas');
    const scale = 32;
    canvas.width = SIZE * scale;
    canvas.height = SIZE * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell !== 'transparent') {
          ctx.fillStyle = cell;
          ctx.fillRect(c * scale, r * scale, scale, scale);
        }
      });
    });
    const a = document.createElement('a');
    a.download = 'pixel-avatar.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div style={{ background: bgColor, }}>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Pixel Avatar</h1>

      {/* Палитра */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, maxWidth: 280 }}>
        {PALETTE.map(c => (
          <div
            key={c}
            onClick={() => { setColor(c); setTool('draw'); }}
            style={{
              width: 28, height: 28, borderRadius: 6, background: c,
              border: color === c && tool === 'draw' ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
            }}
          />
        ))}
        <input type="color" value={color} onChange={e => { setColor(e.target.value); setTool('draw'); }}
          style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', padding: 0 }} />
      </div>

      {/* Инструменты */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['draw', 'erase'] as const).map(t => (
          <button key={t} onClick={() => setTool(t)}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: tool === t ? 'white' : 'transparent', color: tool === t ? '#0f0f1a' : 'white', cursor: 'pointer' }}>
            {t === 'draw' ? '✏️ Рисовать' : '🧹 Стереть'}
          </button>
        ))}
        <button onClick={() => setGrid(emptyGrid())}
          style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer' }}>
          🗑 Очистить
        </button>
        <button onClick={() => {
          setGrid(randomGrid());
          setBg(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
        }}>
          🎲 Случайный
        </button>
        <button onClick={downloadPNG}
          style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#7209b7', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
          ⬇️ Скачать PNG
        </button>
      </div>

      {/* Сетка */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          width: 'min(80vh, 80vw)',
          height: 'min(80vh, 80vw)',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'crosshair',
          userSelect: 'none',
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                background: cell === 'transparent' ? (((r + c) % 2 === 0) ? '#1a1a2e' : '#16213e') : cell,
                outline: '0.5px solid rgba(255,255,255,0.05)',
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
