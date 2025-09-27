import React from 'react';
import { cn } from '../lib/utils';

const transitionClass = 'transition-all duration-200 ease-in-out';

export function RobotFace({ animation, className, eyePosition = {x: 0, y: 0}, isEyeRolling = false }) {
  const pupilX = Math.max(-1, Math.min(1, eyePosition.x)) * 3;
  const pupilY = Math.max(-1, Math.min(1, eyePosition.y)) * 2;
  const pupilTransform = `translate(${pupilX}px, ${pupilY}px)`;

  const isTalking = animation === 'talking';
  const isThinking = animation === 'thinking';
  const isAngry = animation === 'angry';
  const isHappy = animation === 'happy';
  const isOffline = animation === 'offline';
  const isCurious = animation === 'curious';
  const isSad = animation === 'sad';
  const isShocked = animation === 'shocked';
  const isWinking = animation === 'wink';

  let mouthHeight = 2;
  if (isTalking) mouthHeight = 8;
  else if (animation === 'mouthOpen' || isShocked) mouthHeight = 16;
  else if (animation === 'smile' || isHappy) mouthHeight = 4;
  else if (isAngry || isSad) mouthHeight = 2;

  let eyebrowLeftY = 30;
  let eyebrowRightY = 30;
  let eyebrowLeftRotation = 0;
  let eyebrowRightRotation = 0;

  if (isAngry) {
    eyebrowLeftY = 32;
    eyebrowRightY = 32;
    eyebrowLeftRotation = 10;
    eyebrowRightRotation = -10;
  } else if (isEyeRolling) {
    eyebrowLeftY = 28;
    eyebrowRightY = 28;
  } else if (isHappy) {
    eyebrowLeftY = 28;
    eyebrowRightY = 28;
  } else if (isCurious) {
    eyebrowLeftY = 28;
  } else if (isSad) {
    eyebrowLeftY = 33;
    eyebrowRightY = 33;
    eyebrowLeftRotation = -8;
    eyebrowRightRotation = 8;
  } else if (isShocked) {
    eyebrowLeftY = 27;
    eyebrowRightY = 27;
  }

  const primaryColor = '#6366f1'; // indigo-500
  const backgroundColor = '#0f172a'; // slate-900

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('w-full h-full relative', transitionClass, isOffline ? 'opacity-40' : 'opacity-100', className)}
      aria-label="Cortex robot face"
      style={{
        filter: isOffline ? 'none' : 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.3))'
      }}
    >
      <defs>
        <filter id="cortex-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>
          {`
            @keyframes float-zzz {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(-20px) rotate(10deg); opacity: 0; }
            }
            @keyframes pulse-subtle {
              0%, 100% { opacity: 0.8; }
              50% { opacity: 1; }
            }
            .zzz-1 { animation: float-zzz 2s ease-out infinite; animation-delay: 0s; }
            .zzz-2 { animation: float-zzz 2s ease-out infinite; animation-delay: 0.5s; }
            .zzz-3 { animation: float-zzz 2s ease-out infinite; animation-delay: 1s; }
            .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
          `}
        </style>
      </defs>

      {/* Sleeping ZZZs */}
      {isOffline && (
        <g fill={primaryColor} fontSize="8" fontWeight="bold" fontFamily="monospace">
          <text x="75" y="30" className="zzz-1">Z</text>
          <text x="80" y="25" className="zzz-2">z</text>
          <text x="85" y="20" className="zzz-3">z</text>
        </g>
      )}

      {/* Thinking Bubble */}
      {isThinking && (
        <g fill="none" stroke={primaryColor} strokeWidth="1">
          <circle cx="80" cy="20" r="8" filter="url(#cortex-glow)" />
          <circle cx="72" cy="30" r="4" />
          <circle cx="65" cy="35" r="2" />
        </g>
      )}

      {/* Eyebrows */}
      <g fill={primaryColor} className={cn(transitionClass, isThinking && 'animate-pulse')}>
        <rect
          x="25"
          y={eyebrowLeftY}
          width="20"
          height="3"
          rx="1.5"
          transform={`rotate(${eyebrowLeftRotation} 35 31.5)`}
          className={transitionClass}
        />
        <rect
          x="55"
          y={eyebrowRightY}
          width="20"
          height="3"
          rx="1.5"
          transform={`rotate(${eyebrowRightRotation} 65 31.5)`}
          className={transitionClass}
        />
      </g>

      {/* Eyes */}
      <g>
        {/* Left Eye */}
        <g transform="translate(25, 45)" className={cn(animation === 'neutral' && !isOffline && 'animate-pulse-subtle')}>
          <rect
            width="20"
            height={(animation === 'blink' || isOffline || isWinking) ? "1" : "12"}
            y={(animation === 'blink' || isOffline || isWinking) ? 5.5 : 0}
            fill={primaryColor}
            rx="2"
            className={transitionClass}
            filter={isThinking ? 'url(#cortex-glow)' : 'none'}
          />
          <circle
            cx="10"
            cy="6"
            r="3"
            fill={backgroundColor}
            className={transitionClass}
            style={{
              transform: pupilTransform,
              transition: isEyeRolling ? 'transform 0.1s linear' : 'transform 0.2s ease-out',
              opacity: (animation === 'blink' || isOffline || isWinking) ? 0 : 1
            }}
          />
        </g>
        {/* Right Eye */}
        <g transform="translate(55, 45)" className={cn(animation === 'neutral' && !isOffline && 'animate-pulse-subtle')}>
          <rect
            width="20"
            height={animation === 'blink' || isOffline ? "1" : "12"}
            y={animation === 'blink' || isOffline ? 5.5 : 0}
            fill={primaryColor}
            rx="2"
            className={transitionClass}
            filter={isThinking ? 'url(#cortex-glow)' : 'none'}
          />
          <circle
            cx="10"
            cy="6"
            r="3"
            fill={backgroundColor}
            className={transitionClass}
            style={{
              transform: pupilTransform,
              transition: isEyeRolling ? 'transform 0.1s linear' : 'transform 0.2s ease-out',
              opacity: animation === 'blink' || isOffline ? 0 : 1
            }}
          />
        </g>
      </g>

      {/* Mouth */}
      <g className={transitionClass}>
        {isHappy || animation === 'smile' ? (
          <path
            d={`M 30 75 Q 50 ${75 + (isHappy ? 10 : 5)} 70 75`}
            stroke={primaryColor}
            strokeWidth="3"
            fill="none"
            className={transitionClass}
          />
        ) : isSad ? (
          <path
            d="M 30 80 Q 50 70 70 80"
            stroke={primaryColor}
            strokeWidth="3"
            fill="none"
            className={transitionClass}
          />
        ) : isEyeRolling ? (
          <path
            d="M 35 80 H 65"
            stroke={primaryColor}
            strokeWidth="3"
            fill="none"
            className={transitionClass}
          />
        ) : (
          <rect
            x="30"
            y={78 - mouthHeight / 2}
            width="40"
            height={mouthHeight}
            rx="2"
            fill={primaryColor}
            className={transitionClass}
          />
        )}
      </g>
    </svg>
  );
}