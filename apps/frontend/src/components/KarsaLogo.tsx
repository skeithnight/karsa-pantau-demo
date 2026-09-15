'use client';

import React from 'react';

interface KarsaLogoProps {
  /** Width and height in pixels (square). Default 40. */
  size?: number;
  /** Optional extra CSS classes for the wrapper. */
  className?: string;
  /** Show gradient brand colors or monochrome white. Default 'brand'. */
  variant?: 'brand' | 'white' | 'dark';
}

/**
 * KarsaLogo — SVG icon inspired by the Karsa "K" node‑network mark.
 *
 * The letter K is formed by connected nodes (circles) and links (lines/arrows),
 * representing a structured data network — matching the original Karsa brand.
 *
 * Variants:
 *  - brand  → gradient amber→sky nodes with sky‑blue links (for dark bg)
 *  - white  → solid white (for dark bg, simpler)
 *  - dark   → solid dark slate (for light bg)
 */
export function KarsaLogo({ size = 40, className = '', variant = 'brand' }: KarsaLogoProps) {
  const id = React.useId();

  // Gradient IDs need to be unique when multiple logos render on the same page
  const gradNodeId = `${id}-grad-node`;
  const gradLinkId = `${id}-grad-link`;
  const gradGlowId = `${id}-grad-glow`;

  const isBrand = variant === 'brand';
  const nodeColor = variant === 'white' ? '#ffffff' : variant === 'dark' ? '#1e293b' : undefined;
  const linkColor = variant === 'white' ? '#ffffff' : variant === 'dark' ? '#334155' : undefined;

  // Node positions that form a stylized "K":
  // Vertical bar (spine): top, mid, bottom
  // Diagonal arms branching from mid: upper-right, lower-right
  // Plus end-nodes on the arms

  // Coordinate system: viewBox 0 0 100 100
  const spine = {
    top:    { cx: 30, cy: 14 },
    mid:    { cx: 30, cy: 50 },
    bottom: { cx: 30, cy: 86 },
  };

  const arms = {
    upperMid:  { cx: 55, cy: 32 },
    upperEnd:  { cx: 76, cy: 14 },
    lowerMid:  { cx: 55, cy: 68 },
    lowerEnd:  { cx: 76, cy: 86 },
  };

  const nodeR = 6.5;
  const smallNodeR = 5;
  const linkWidth = 4;

  // Helper: line between two points
  type Pt = { cx: number; cy: number };
  const link = (a: Pt, b: Pt, key: string) => (
    <line
      key={key}
      x1={a.cx} y1={a.cy}
      x2={b.cx} y2={b.cy}
      stroke={isBrand ? `url(#${gradLinkId})` : linkColor}
      strokeWidth={linkWidth}
      strokeLinecap="round"
    />
  );

  const node = (p: Pt, r: number, key: string) => (
    <circle
      key={key}
      cx={p.cx} cy={p.cy} r={r}
      fill={isBrand ? `url(#${gradNodeId})` : nodeColor}
    />
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      className={className}
      role="img"
      aria-label="Karsa Pantau Logo"
    >
      {isBrand && (
        <defs>
          {/* Node gradient: amber → sky */}
          <linearGradient id={gradNodeId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          {/* Link gradient */}
          <linearGradient id={gradLinkId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.7" />
          </linearGradient>
          {/* Subtle glow */}
          <radialGradient id={gradGlowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}

      {/* Subtle glow background (brand only) */}
      {isBrand && <circle cx="50" cy="50" r="48" fill={`url(#${gradGlowId})`} />}

      {/* Links (drawn first, behind nodes) */}
      {link(spine.top, spine.mid, 'l-spine-upper')}
      {link(spine.mid, spine.bottom, 'l-spine-lower')}
      {link(spine.mid, arms.upperMid, 'l-arm-upper-1')}
      {link(arms.upperMid, arms.upperEnd, 'l-arm-upper-2')}
      {link(spine.mid, arms.lowerMid, 'l-arm-lower-1')}
      {link(arms.lowerMid, arms.lowerEnd, 'l-arm-lower-2')}

      {/* Nodes */}
      {node(spine.top, nodeR, 'n-top')}
      {node(spine.mid, nodeR + 1.5, 'n-mid')}  {/* Center node slightly bigger */}
      {node(spine.bottom, nodeR, 'n-bottom')}
      {node(arms.upperMid, smallNodeR, 'n-um')}
      {node(arms.upperEnd, nodeR, 'n-ue')}
      {node(arms.lowerMid, smallNodeR, 'n-lm')}
      {node(arms.lowerEnd, nodeR, 'n-le')}
    </svg>
  );
}

export default KarsaLogo;
