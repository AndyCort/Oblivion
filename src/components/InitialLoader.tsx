import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, type Variants } from 'framer-motion';

const LoaderOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  z-index: 9999;
  flex-direction: column;
  gap: 20px;
`;

const TypographyLogo = styled(motion.h1)`
  font-family: var(--title-font);
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 800;
  color: var(--title-color);
  letter-spacing: 0.1em;
  margin: 0;
  display: flex;
  overflow: hidden;

  span {
    color: var(--main-color);
  }
`;

const ProgressBarContainer = styled(motion.div)`
  width: 200px;
  height: 2px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ProgressBarFill = styled(motion.div)`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--main-color);
  border-radius: 4px;
`;

interface InitialLoaderProps {
  onLoadingComplete: () => void;
}

const letterVariants: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

export default function InitialLoader({ onLoadingComplete }: InitialLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const duration = 2000; // 2 seconds total minimum load time
    const interval = 20;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onLoadingComplete, 400); // Wait a tiny bit after reaching 100%
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  const text = "Oblivion";

  return (
    <LoaderOverlay
      exit={{
        opacity: 0,
        y: -50,
        transition: { duration: 0.6, ease: "easeInOut" }
      }}
    >
      <TypographyLogo>
        {text.split('').map((letter, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={letterVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'inline-block' }}
          >
            {index === 0 ? <span>{letter}</span> : letter}
          </motion.div>
        ))}
      </TypographyLogo>

      <ProgressBarContainer
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <ProgressBarFill
          style={{ width: `${progress}%` }}
        />
      </ProgressBarContainer>
    </LoaderOverlay>
  );
}
