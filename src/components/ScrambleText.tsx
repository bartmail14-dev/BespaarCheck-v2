import { useState, useEffect, useRef } from 'react';

interface ScrambleTextProps {
  text: string;
  isAnimating: boolean;
  className?: string;
  scrambleDuration?: number; // Total animation duration in ms
  revealDelay?: number; // Delay before starting reveal
  charactersPerFrame?: number; // How many characters to reveal per frame
  scrambleChars?: string;
}

const DEFAULT_SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>[]{}|/\\';

export function ScrambleText({
  text,
  isAnimating,
  className = '',
  scrambleDuration = 1500,
  revealDelay = 200,
  scrambleChars = DEFAULT_SCRAMBLE_CHARS,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isAnimating) {
      setIsScrambling(true);
      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const totalDuration = scrambleDuration + revealDelay;

        if (elapsed < revealDelay) {
          // Pure scramble phase - all characters are random
          const scrambled = text
            .split('')
            .map((char) => {
              if (char === ' ') return ' ';
              return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            })
            .join('');
          setDisplayText(scrambled);
        } else {
          // Reveal phase - progressively reveal real characters
          const revealProgress = (elapsed - revealDelay) / scrambleDuration;
          const charsToReveal = Math.floor(revealProgress * text.length);

          const result = text.split('').map((char, index) => {
            if (char === ' ') return ' ';
            if (index < charsToReveal) {
              return char;
            }
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          });

          setDisplayText(result.join(''));
        }

        if (elapsed < totalDuration) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayText(text);
          setIsScrambling(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      setDisplayText(text);
    }
  }, [isAnimating, text, scrambleDuration, revealDelay, scrambleChars]);

  // Update text when it changes without animation
  useEffect(() => {
    if (!isAnimating && !isScrambling) {
      setDisplayText(text);
    }
  }, [text, isAnimating, isScrambling]);

  return (
    <span className={`${className} ${isScrambling ? 'font-mono' : ''}`}>
      {displayText}
    </span>
  );
}

// Hook version for more control
export function useScrambleText(
  text: string,
  trigger: boolean,
  options: {
    scrambleDuration?: number;
    revealDelay?: number;
    scrambleChars?: string;
  } = {}
) {
  const {
    scrambleDuration = 1500,
    revealDelay = 200,
    scrambleChars = DEFAULT_SCRAMBLE_CHARS,
  } = options;

  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const previousTrigger = useRef(trigger);

  useEffect(() => {
    // Only animate when trigger changes from false to true
    if (trigger && !previousTrigger.current) {
      setIsScrambling(true);
      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const totalDuration = scrambleDuration + revealDelay;

        if (elapsed < revealDelay) {
          const scrambled = text
            .split('')
            .map((char) => {
              if (char === ' ') return ' ';
              return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            })
            .join('');
          setDisplayText(scrambled);
        } else {
          const revealProgress = (elapsed - revealDelay) / scrambleDuration;
          const charsToReveal = Math.floor(revealProgress * text.length);

          const result = text.split('').map((char, index) => {
            if (char === ' ') return ' ';
            if (index < charsToReveal) {
              return char;
            }
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          });

          setDisplayText(result.join(''));
        }

        if (elapsed < totalDuration) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayText(text);
          setIsScrambling(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    previousTrigger.current = trigger;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, text, scrambleDuration, revealDelay, scrambleChars]);

  useEffect(() => {
    if (!isScrambling) {
      setDisplayText(text);
    }
  }, [text, isScrambling]);

  return { displayText, isScrambling };
}

// Multi-line scramble for blocks of text
interface ScrambleBlockProps {
  lines: { key: string; text: string; className?: string }[];
  isAnimating: boolean;
  staggerDelay?: number; // Delay between each line starting
  lineScrambleDuration?: number;
}

export function ScrambleBlock({
  lines,
  isAnimating,
  staggerDelay = 150,
  lineScrambleDuration = 800,
}: ScrambleBlockProps) {
  const [activeLines, setActiveLines] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAnimating) {
      setActiveLines(new Set());

      lines.forEach((line, index) => {
        setTimeout(() => {
          setActiveLines((prev) => new Set([...prev, line.key]));
        }, index * staggerDelay);
      });
    }
  }, [isAnimating, lines, staggerDelay]);

  return (
    <>
      {lines.map((line) => (
        <ScrambleText
          key={line.key}
          text={line.text}
          isAnimating={activeLines.has(line.key)}
          className={line.className}
          scrambleDuration={lineScrambleDuration}
          revealDelay={100}
        />
      ))}
    </>
  );
}
