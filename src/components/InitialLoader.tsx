import { useEffect, useState } from 'react';

interface InitialLoaderProps {
  onLoadingComplete: () => void;
}

export default function InitialLoader({ onLoadingComplete }: InitialLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const duration = 2000;
    const interval = 20;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setExiting(true);
          setTimeout(onLoadingComplete, 600);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  const text = "Oblivion";

  return (
    <div className={`loader-overlay ${exiting ? 'exiting' : ''}`}>
      <h1 className="loader-logo">
        {text.split('').map((letter, index) => (
          <span
            key={index}
            className="loader-letter"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {index === 0 ? <span className="accent">{letter}</span> : letter}
          </span>
        ))}
      </h1>

      <div className="loader-progress-container">
        <div className="loader-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
