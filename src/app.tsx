import { useState, useRef, useEffect } from "preact/hooks";

type SnakeType = {
  points: number[];
  orientation: number;
};

export function App() {
  const widthRef = useRef(16);
  const width = widthRef.current;
  const [gameState, setGameState] = useState("START");
  const area = width * width;
  const [food, setFood] = useState(Math.floor(Math.random() * area));
  const [score, setScore] = useState(0);
  const gridRef = useRef(new Array(area).fill(0));
  const grid = gridRef.current;
  const intervalRef = useRef<number | null>(null);

  const [snake, setSnake] = useState<SnakeType>({
    points: [2, 1, 0],
    orientation: 1,
  });

  const step = (foodPt: number) => {
    let found = false;
    setSnake((prev) => {
      const newPoints = prev.points.slice();
      newPoints.pop();
      let newPoint = prev.points[0] + prev.orientation;
      if (newPoint < 0) {
        newPoint = area + newPoint;
      }
      else {
        newPoint %= area;
      }
      if (new Set(newPoints).has(newPoint)) {
        setGameState("OVER");
        if (intervalRef.current) {
          clearInterval(intervalRef?.current);
        }
        return {
          ...prev,
          points: newPoints,
        };
      }

      newPoints.unshift(newPoint);
      if (newPoint === foodPt) {
        setFood(Math.floor(Math.random() * area));
        setScore((prev) => prev + 1);
        found = true;
      }

      return {
        ...prev,
        points: newPoints,
      };
    });
    if (found) {
      increaseLength();
    }
  };

  const increaseLength = () => {
    setSnake((prev) => {
      const newPoints = prev.points.slice();
      let newPoint = prev.points[0] + prev.orientation;
      if (newPoint < 0) {
        newPoint = area + newPoint;
      }
      else {
        newPoint %= area;
      }
      if (new Set(newPoints).has(newPoint)) {
        setGameState("OVER");
        if (intervalRef.current) {
          clearInterval(intervalRef?.current);
        }
        return {
          ...prev,
          points: newPoints,
        };
      }

      newPoints.unshift(newPoint);
      return {
        ...prev,
        points: newPoints,
      };
    });
  };

  const handleKeyDown = (ev: KeyboardEvent) => {
    if (gameState === "OVER") {
      return;
    }
    const keyCode = ev.key;
    if (keyCode === "ArrowRight" && snake.orientation !== -1) {
      setSnake((prev) => ({ ...prev, orientation: 1 }));
    }
    if (keyCode === "ArrowLeft" && snake.orientation !== 1) {
      setSnake((prev) => ({ ...prev, orientation: -1 }));
    }
    if (keyCode === "ArrowUp" && snake.orientation !== width) {
      setSnake((prev) => ({ ...prev, orientation: -width }));
    }
    if (keyCode === "ArrowDown" && snake.orientation !== -width) {
      setSnake((prev) => ({ ...prev, orientation: width }));
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [snake.orientation]);

  const restart = () => {
    gridRef.current = new Array(area).fill(0);
    setGameState("START");
    setSnake({
      points: [2, 1, 0],
      orientation: 1,
    });
  };

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (gameState === "START") {
      intervalRef.current = setInterval(() => {
        step(food);
      }, 300);
    }
  }, [gameState, food]);
  const snakePoints = new Set(snake.points);
  return (
    <div className="flex flex-col w-full min-h-screen">
      <header className="flex flex-row items-center justify-center p-4 text-white font-bold text-4xl bg-green-400">
        <h1>One More Snake</h1>
      </header>

      <main className="flex flex-col w-full">
        <h2 className="font-bold text-2xl p-2 self-center">Score {score}</h2>
        <div
          className="grid p-8 lg:w-2/3 self-center"
          style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}
        >
          {grid.map((_, i) => (
            <div
              key={`gridItem-${i}`}
              className={`${i === food ? "bg-red-600" : ""} ${
                gameState === "OVER" ? "bg-red-400" : ""
              } ${snakePoints.has(i) ? "bg-orange-400" : ""} ${
                i % 2 === 0 ? "bg-green-400" : "bg-green-200"
              } p-4 border-2 border-black`}
            />
          ))}
        </div>
        {gameState === "OVER" ? (
          <button
            className="mb-8 p-6 border-2 border-black w-1/3 rounded-lg self-center"
            onClick={restart}
          >
            Restart
          </button>
        ) : null}
      </main>
    </div>
  );
}
