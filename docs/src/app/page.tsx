"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MouseLeftClick, Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface GameState {
  status: "waiting" | "playing" | "cooldown";
  clicks: number;
  timeLeft: number;
  cooldownLeft: number;
}

interface Ripple {
  x: number;
  y: number;
  key: number;
}

export default function ClickSpeed() {
  const [gameState, setGameState] = useState<GameState>({
    status: "waiting",
    clicks: 0,
    timeLeft: 8,
    cooldownLeft: 4,
  });

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleKey = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const startGame = useCallback(() => {
    setGameState({
      status: "playing",
      clicks: 0,
      timeLeft: 8,
      cooldownLeft: 4,
    });

    setTimeout(() => {
      buttonRef.current?.focus();
    }, 100);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (gameState.status === "playing") {
        setGameState((prev) => ({
          ...prev,
          clicks: prev.clicks + 1,
        }));

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setRipples((prev) => [...prev, { x, y, key: rippleKey.current++ }]);
      }
    },
    [gameState.status],
  );

  const handleRippleComplete = (key: number) => {
    setRipples((prev) => prev.filter((r) => r.key !== key));
  };

  const endGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: "cooldown",
    }));

    setTimeout(() => {
      setGameState({
        status: "waiting",
        clicks: 0,
        timeLeft: 8,
        cooldownLeft: 4,
      });
    }, 4000);
  }, []);

  useEffect(() => {
    if (gameState.status === "playing" && gameState.timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setGameState((prev) => {
          if (prev.timeLeft <= 1) {
            setTimeout(endGame, 0);
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameState.status, gameState.timeLeft, endGame]);

  useEffect(() => {
    if (gameState.status === "cooldown" && gameState.cooldownLeft > 0) {
      timerRef.current = setTimeout(() => {
        setGameState((prev) => {
          if (prev.cooldownLeft <= 1) {
            setTimeout(() => {
              setGameState({
                status: "waiting",
                clicks: 0,
                timeLeft: 8,
                cooldownLeft: 4,
              });
            }, 0);
            return { ...prev, cooldownLeft: 0 };
          }
          return { ...prev, cooldownLeft: prev.cooldownLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameState.status, gameState.cooldownLeft]);

  const getCurrentClickSpeed = () => {
    if (gameState.status === "playing" && gameState.timeLeft < 8) {
      const elapsed = 8 - gameState.timeLeft;
      return elapsed > 0 ? (gameState.clicks / elapsed).toFixed(1) : "0.0";
    }
    return "0.0";
  };

  const getFinalClickSpeed = () => {
    return (gameState.clicks / 8).toFixed(1);
  };

  const isButtonDisabled = gameState.status === "cooldown";

  const getButtonIcon = () => {
    if (gameState.status === "cooldown") {
      return <Spinner size={32} className="animate-spin" />;
    }
    return <MouseLeftClick size={32} />;
  };

  const getSummary = () => {
    let summary =
      "Click the button to start. You have 8 seconds to click as fast as you can.";
    if (gameState.status === "playing" || gameState.status === "waiting") {
      summary += ` You have ${gameState.timeLeft}.0 seconds left and your current speed is ${getCurrentClickSpeed()} clicks per second.`;
    } else if (gameState.status === "cooldown") {
      summary += ` You have ${gameState.timeLeft}.0 seconds left and your current speed is ${getFinalClickSpeed()} clicks per second.`;
    }
    return summary;
  };

  return (
    <div className="min-h-screen bg-indigo-300 flex flex-col items-center justify-center p-8">
      <div className="relative w-80 h-80">
        <Button
          ref={buttonRef}
          onClick={
            gameState.status === "waiting" ? startGame : (e) => handleClick(e)
          }
          disabled={isButtonDisabled}
          className="w-80 h-80 text-3xl bg-indigo-900 hover:bg-indigo-900 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
          tabIndex={0}
          variant="default"
          size="lg"
          style={{ position: "absolute", inset: 0 }}
        >
          {getButtonIcon()}
          <span className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {ripples.map((ripple) => (
                <motion.span
                  key={ripple.key}
                  initial={{
                    opacity: 0.1,
                    scale: 0,
                    left: ripple.x - 120,
                    top: ripple.y - 120,
                  }}
                  animate={{
                    opacity: 0,
                    scale: 2,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "linear" }}
                  style={{
                    position: "absolute",
                    width: 240,
                    height: 240,
                    background: "rgba(255,255,255,0.4)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                  }}
                  onAnimationComplete={() => handleRippleComplete(ripple.key)}
                />
              ))}
            </AnimatePresence>
          </span>
        </Button>
      </div>

      <p className="mt-8 text-center text-md text-indigo-950 max-w-xl">
        {getSummary()}
      </p>
    </div>
  );
}
