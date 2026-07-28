import { useState, useEffect, useCallback } from 'react';
/**
 * Loader — Handles the initial loading animation with sessionStorage check.
 * Self-removes once loading is complete.
 */
export default function Loader() {
  const [isInitialLoad, setIsInitialLoad] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return !sessionStorage.getItem('hasLoaded');
  });

  const [exiting, setExiting] = useState(false);

  const handleLoadingComplete = useCallback(() => {
    sessionStorage.setItem('hasLoaded', 'true');
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) return;

    const hideLoader = () => {
      setExiting(true);
      setTimeout(handleLoadingComplete, 180000); // Wait for the whole animation sequence (1.8s)
    };

    if (document.readyState === 'complete') {
      const timer = setTimeout(hideLoader, 300);
      return () => clearTimeout(timer);
    } else {
      window.addEventListener('load', hideLoader);
      const fallbackTimer = setTimeout(hideLoader, 8000);

      return () => {
        window.removeEventListener('load', hideLoader);
        clearTimeout(fallbackTimer);
      };
    }
  }, [isInitialLoad, handleLoadingComplete]);

  if (!isInitialLoad) return null;

  return (
    <div className={`loader-overlay ${exiting ? 'exiting' : ''}`}>
      <div className="envelope-wrapper">
        <div className="envelope-container">
          <div className="letter">
            <div className="letter-line" style={{ width: '80%' }} />
            <div className="letter-line" style={{ width: '60%' }} />
            <div className="letter-line" style={{ width: '70%', marginTop: 'auto' }} />
          </div>
          <div className="front" />
          <div className="flap" />
        </div>
      </div>

      <style>{`
        .loader-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-0, #ffffff);
          z-index: 9999;
        }

        .loader-overlay.exiting {
          animation: overlayFadeOut 0.6s ease-out 1.2s forwards;
        }

        @keyframes overlayFadeOut {
          0% { opacity: 1; visibility: visible; }
          100% { opacity: 0; visibility: hidden; }
        }

        .envelope-wrapper {
          perspective: 1000px;
          animation: envelopeFloat 2s ease-in-out infinite;
        }

        .loader-overlay.exiting .envelope-wrapper {
          animation: envelopeFall 0.8s cubic-bezier(0.5, 0, 1, 1) 0.6s forwards;
        }

        @keyframes envelopeFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes envelopeFall {
          0% { transform: translateY(0px) rotateZ(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotateZ(15deg); opacity: 0; }
        }

        .envelope-container {
          width: 160px;
          height: 110px;
          position: relative;
          border-radius: 6px;
          background: color-mix(in srgb, var(--main-color, #f43f5e) 40%, black);
          box-shadow: var(--box-shadow);
          transform-style: preserve-3d;
        }

        .letter {
          position: absolute;
          left: 15px;
          right: 15px;
          bottom: 15px;
          height: 75px;
          background: #ffffff;
          border-radius: 4px;
          padding: 15px 12px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .loader-overlay.exiting .letter {
          animation: letterPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s forwards;
        }

        @keyframes letterPop {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50px); }
        }

        .letter-line {
          height: 6px;
          background: #f3f4f6;
          border-radius: 3px;
        }

        .front {
          position: absolute;
          inset: 0;
          clip-path: polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%);
          background: color-mix(in srgb, var(--main-color, #f43f5e) 90%, black);
          border-radius: 6px;
          z-index: 3;
        }

        .flap {
          position: absolute;
          inset: 0;
          clip-path: polygon(0 0, 100% 0, 50% 56%);
          background: var(--main-color, #f43f5e);
          transform-origin: top;
          z-index: 4;
        }

        .loader-overlay.exiting .flap {
          animation: openFlap 0.5s ease-out forwards;
        }

        @keyframes openFlap {
          0% { 
            transform: rotateX(0deg); 
            background: var(--main-color, #f43f5e);
            z-index: 4;
          }
          49% {
            z-index: 4;
          }
          50% {
            z-index: 1;
          }
          100% { 
            transform: rotateX(180deg); 
            background: color-mix(in srgb, var(--main-color, #f43f5e) 80%, black);
            z-index: 1;
          }
        }
      `}</style>
    </div>
  );
}
