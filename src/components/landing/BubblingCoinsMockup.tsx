"use client";

import { useEffect, useRef } from "react";

type CoinDef = {
  symbol: string;
  name: string;
  xPct: number; // Start x as % of container width
  yPct: number; // Start y as % of container width
  r: number;    // Radius in pixels
  color: string;
  glowColor: string;
};

const coinList: CoinDef[] = [
  { symbol: "btc", name: "Bitcoin", xPct: 10, yPct: 15, r: 44, color: "#ff9900", glowColor: "rgba(247, 147, 26, 0.4)" },
  { symbol: "eth", name: "Ethereum", xPct: 26, yPct: 12, r: 42, color: "#627eea", glowColor: "rgba(98, 126, 234, 0.4)" },
  { symbol: "sol", name: "Solana", xPct: 42, yPct: 16, r: 43, color: "#a855f7", glowColor: "rgba(168, 85, 247, 0.45)" },
  { symbol: "usdc", name: "USDC", xPct: 58, yPct: 12, r: 42, color: "#00c980", glowColor: "rgba(0, 201, 128, 0.4)" },
  { symbol: "usdt", name: "USDT", xPct: 74, yPct: 16, r: 41, color: "#26a17b", glowColor: "rgba(38, 161, 123, 0.4)" },
  { symbol: "arb", name: "Arbitrum", xPct: 90, yPct: 12, r: 42, color: "#28a0f0", glowColor: "rgba(40, 160, 240, 0.35)" },
  
  { symbol: "mantle", name: "Mantle", xPct: 14, yPct: 44, r: 38, color: "#5eead4", glowColor: "rgba(94, 234, 212, 0.35)" },
  { symbol: "bnb", name: "BNB", xPct: 30, yPct: 38, r: 40, color: "#eab308", glowColor: "rgba(234, 179, 8, 0.4)" },
  { symbol: "jup", name: "Jupiter", xPct: 46, yPct: 46, r: 36, color: "#10b981", glowColor: "rgba(16, 185, 129, 0.35)" },
  { symbol: "aave", name: "Aave", xPct: 62, yPct: 38, r: 35, color: "#7c3aed", glowColor: "rgba(124, 58, 237, 0.35)" },
  { symbol: "pol", name: "Polygon Ecosystem", xPct: 78, yPct: 46, r: 36, color: "#8b5cf6", glowColor: "rgba(139, 92, 246, 0.35)" },
  { symbol: "okb", name: "OKB", xPct: 92, yPct: 42, r: 34, color: "#3b82f6", glowColor: "rgba(59, 130, 246, 0.35)" },
  
  { symbol: "sui", name: "Sui", xPct: 20, yPct: 75, r: 34, color: "#0284c7", glowColor: "rgba(2, 132, 199, 0.3)" },
  { symbol: "ton", name: "Toncoin", xPct: 44, yPct: 78, r: 35, color: "#0098ea", glowColor: "rgba(0, 152, 234, 0.35)" },
  { symbol: "xrp", name: "XRP", xPct: 70, yPct: 74, r: 38, color: "#23292f", glowColor: "rgba(35, 41, 47, 0.3)" },
];

function TokenIconSvg({ symbol }: { symbol: string }) {
  if (symbol === "btc") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <path d="M35 22h24c9 0 15 5 15 11 0 5-3 8-7 9.5 6 1.5 9 5.5 9 11.5 0 8-6 12-17 12H35V22zm11.5 9.5v9h7c2.5 0 4-1 4-4.5s-1.5-4.5-4-4.5h-7zm0 17.5v10.5h8c2.5 0 4-1 4-5s-1.5-5.5-4-5.5h-8z" />
        <path d="M44 12v10M52 12v10M44 64v10M52 64v10" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (symbol === "eth") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <polygon points="50,10 80,48 50,65" fillOpacity="0.9" />
        <polygon points="50,10 20,48 50,65" fillOpacity="0.65" />
        <polygon points="50,69 80,52 50,90" fillOpacity="0.9" />
        <polygon points="50,69 20,52 50,90" fillOpacity="0.65" />
      </svg>
    );
  }
  if (symbol === "sol") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <path d="M 20 25 L 80 25 L 65 40 L 5 40 Z" />
        <path d="M 35 45 L 95 45 L 80 60 L 20 60 Z" />
        <path d="M 20 65 L 80 65 L 65 80 L 5 80 Z" />
      </svg>
    );
  }
  if (symbol === "bnb") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <path d="M 50 12 L 78 40 L 63 55 L 78 70 L 50 98 L 22 70 L 37 55 L 22 40 Z" />
        <path d="M 50 36 L 64 50 L 50 64 L 36 50 Z" fillOpacity="0.5" />
      </svg>
    );
  }
  if (symbol === "usdc") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="6" fill="none" />
        <path d="M 38 35 A 18 18 0 0 0 38 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M 62 35 A 18 18 0 0 1 62 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M 50 25 V 75 M 40 42 h 20 M 40 58 h 20" stroke="currentColor" strokeWidth="7.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (symbol === "usdt") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="6" fill="none" />
        <path d="M26 36h48M50 36v36" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <path d="M37 49h26" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }
  if (symbol === "xrp") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <path d="M 20 20 L 50 50 L 80 20 M 50 50 L 50 90" stroke="currentColor" strokeWidth="10.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (symbol === "aave") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <path d="M 50 15 L 85 80 H 70 L 50 38 L 30 80 H 15 Z" />
        <path d="M 38 60 H 62" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      </svg>
    );
  }
  if (symbol === "pol") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round">
        <polygon points="50,15 78,31 78,63 50,79 22,63 22,31" />
        <polygon points="50,33 66,42 66,58 50,67 34,58 34,42" fill="currentColor" fillOpacity="0.5" />
      </svg>
    );
  }
  if (symbol === "okb") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <rect x="25" y="25" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="6" fill="none" />
        <rect x="55" y="25" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="6" fill="none" />
        <rect x="40" y="55" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="6" fill="none" />
      </svg>
    );
  }
  if (symbol === "sui") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <path d="M 50 12 C 65 25 75 42 75 58 C 75 75 62 88 45 88 C 30 88 25 76 25 65 C 25 50 40 38 50 12 Z" />
      </svg>
    );
  }
  if (symbol === "ton") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <path d="M 50 12 L 85 45 L 50 88 L 15 45 Z" fill="none" stroke="currentColor" strokeWidth="8" />
        <path d="M 30 45 L 50 30 L 70 45 L 50 70 Z" />
      </svg>
    );
  }
  if (symbol === "arb") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <path d="M 50 10 L 90 90 L 50 70 L 10 90 Z" />
        <path d="M 50 32 L 76 84 L 50 70 L 24 84 Z" fillOpacity="0.5" />
      </svg>
    );
  }
  if (symbol === "mantle") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="7" strokeDasharray="30 15" />
        <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="5" />
      </svg>
    );
  }
  if (symbol === "jup") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
        <path d="M 20 25 C 40 25 50 35 50 55 C 50 75 40 85 20 85 Z" fill="none" stroke="currentColor" strokeWidth="8" />
        <path d="M 45 15 L 85 50 L 45 85 Z" />
      </svg>
    );
  }
  return null;
}

type PhysicsBubble = {
  symbol: string;
  name: string;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  r: number;
  mass: number;
  color: string;
  glowColor: string;
  element: HTMLDivElement | null;
};

export function BubblingCoinsMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track mouse coordinates relative to container
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize and pre-populate references in body to resolve React hydration/render race conditions
  const bubblesRef = useRef<PhysicsBubble[]>(
    coinList.map((coin) => {
      // Default to 800x480 coordinate space for initial render before useEffect runs
      const initialX = (coin.xPct / 100) * 800;
      const initialY = (coin.yPct / 100) * 480;
      return {
        symbol: coin.symbol,
        name: coin.name,
        x: initialX,
        y: initialY,
        homeX: initialX,
        homeY: initialY,
        vx: 0,
        vy: 0,
        r: coin.r,
        mass: coin.r * coin.r,
        color: coin.color,
        glowColor: coin.glowColor,
        element: null,
      };
    })
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    // Scatter the starting positions across the width and height of the canvas container
    bubblesRef.current.forEach((b, idx) => {
      const coin = coinList[idx];
      const hX = (coin.xPct / 100) * width;
      const hY = (coin.yPct / 100) * height;
      b.homeX = hX;
      b.homeY = hY;
      
      // Scatter them widely from top-to-bottom and left-to-right on page mount
      b.x = hX + (Math.random() - 0.5) * 80;
      b.y = hY + (Math.random() - 0.5) * 80;
      b.vx = (Math.random() - 0.5) * 2;
      b.vy = (Math.random() - 0.5) * 2;
    });

    let active = true;
    let animationFrameId: number;

    // Fluid Physics & Collision Loop
    const loop = () => {
      if (!active) return;

      const currentWidth = container.clientWidth || width;
      const currentHeight = container.clientHeight || height;
      const bubbles = bubblesRef.current;
      const mouse = mouseRef.current;

      // 1. Update general home anchor targets dynamically if resizing occurs
      bubbles.forEach((b, idx) => {
        const coin = coinList[idx];
        b.homeX = (coin.xPct / 100) * currentWidth;
        b.homeY = (coin.yPct / 100) * currentHeight;
      });

      // 2. Physics updates
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];

        // Soft buoyancy / floating drift (sine wave + random walk)
        b.vx += (Math.random() - 0.5) * 0.12;
        b.vy += (Math.random() - 0.5) * 0.12;

        // Anchor spring force (attraction back to home grid slots)
        const springStrength = 0.0022;
        b.vx += (b.homeX - b.x) * springStrength;
        b.vy += (b.homeY - b.y) * springStrength;

        // Frictional damping (drag)
        b.vx *= 0.965;
        b.vy *= 0.965;

        // Mouse repulsion (sweeping sway interaction)
        if (mouse) {
          const dx = b.x - mouse.x;
          const dy = b.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repulsionRadius = 140;

          if (dist < repulsionRadius && dist > 1) {
            // Stronger push when closer
            const push = (repulsionRadius - dist) / repulsionRadius;
            const force = push * 0.65;
            b.vx += (dx / dist) * force;
            b.vy += (dy / dist) * force;
          }
        }

        // Apply updated velocities
        b.x += b.vx;
        b.y += b.vy;

        // 3. Wall Boundaries Bounce
        const bounce = 0.75;
        if (b.x < b.r) {
          b.x = b.r;
          b.vx = -b.vx * bounce;
        } else if (b.x > currentWidth - b.r) {
          b.x = currentWidth - b.r;
          b.vx = -b.vx * bounce;
        }

        if (b.y < b.r) {
          b.y = b.r;
          b.vy = -b.vy * bounce;
        } else if (b.y > currentHeight - b.r) {
          b.y = currentHeight - b.r;
          b.vy = -b.vy * bounce;
        }
      }

      // 4. Circle-to-Circle Elastic Bubble Collisions
      const restitution = 0.85; // elasticity coefficient
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const bi = bubbles[i];
          const bj = bubbles[j];

          const dx = bj.x - bi.x;
          const dy = bj.y - bi.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = bi.r + bj.r;

          if (dist < minDist && dist > 0.1) {
            // Overlap detected: move apart elastically to resolve overlap
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            // Push apart proportional to mass distribution
            const totalMass = bi.mass + bj.mass;
            const pullBi = (bj.mass / totalMass) * overlap;
            const pullBj = (bi.mass / totalMass) * overlap;

            bi.x -= nx * pullBi;
            bi.y -= ny * pullBi;
            bj.x += nx * pullBj;
            bj.y += ny * pullBj;

            // Calculate relative velocity
            const rvx = bj.vx - bi.vx;
            const rvy = bj.vy - bi.vy;
            const velAlongNormal = rvx * nx + rvy * ny;

            // Only resolve velocities if they are moving towards each other
            if (velAlongNormal < 0) {
              const impulse = -(1 + restitution) * velAlongNormal / (1 / bi.mass + 1 / bj.mass);
              
              bi.vx -= (impulse * nx) / bi.mass;
              bi.vy -= (impulse * ny) / bi.mass;
              bj.vx += (impulse * nx) / bj.mass;
              bj.vy += (impulse * ny) / bj.mass;
            }
          }
        }
      }

      // 5. Commit direct DOM updates (bypasses React loop for 60fps performance)
      bubbles.forEach((b) => {
        if (b.element) {
          b.element.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0)`;
        }
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    // Start simulation
    loop();

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Track cursor position inside canvas container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[450px] overflow-visible select-none"
    >
      {/* Absolute floating bubbles layer */}
      {coinList.map((coin, idx) => {
        // Compute pre-translate values during SSR/hydration to avoid top-left flashes
        const initialX = (coin.xPct / 100) * 600;
        const initialY = (coin.yPct / 100) * 450;
        return (
          <div
            key={coin.symbol}
            ref={(el) => {
              if (bubblesRef.current[idx]) {
                bubblesRef.current[idx].element = el;
              }
            }}
            className="absolute rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing will-change-transform"
            style={{
              width: coin.r * 2,
              height: coin.r * 2,
              left: 0,
              top: 0,
              transform: `translate3d(${initialX - coin.r}px, ${initialY - coin.r}px, 0)`,
              
              // Matte glassmorphism style (purple-blue-pink gradient gloss)
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.45)",
              
              // Distinct outer brand shadow + inset 3D lighting shadows
              boxShadow: `0 12px 30px -6px rgba(0, 0, 0, 0.22), inset 0 2px 4px rgba(255, 255, 255, 0.45), inset 0 -8px 16px rgba(0, 0, 0, 0.25), 0 0 20px ${coin.glowColor}`,
            }}
          >
            {/* Iridescent soap-bubble / holographic overlay */}
            <div
              className="absolute inset-0 rounded-full mix-blend-overlay pointer-events-none opacity-45 bg-gradient-to-tr"
              style={{
                backgroundImage: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)",
              }}
            />

            {/* Inner brand glow circle */}
            <div
              className="absolute inset-[3px] rounded-full pointer-events-none opacity-20"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${coin.color}40, ${coin.color}10)`,
              }}
            />

            {/* Screen glare reflection bar */}
            <div
              className="absolute inset-[1px] rounded-full pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)",
              }}
            />

            {/* Centered Vector Logo */}
            <div className="relative z-10 flex items-center justify-center w-full h-full p-2.5 text-white filter drop-shadow-[0_2px_6px_rgba(255,255,255,0.15)]">
              <TokenIconSvg symbol={coin.symbol} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
