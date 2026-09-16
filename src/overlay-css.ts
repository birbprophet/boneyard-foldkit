import type { Bone, SkeletonResult } from "boneyard-js";
import * as Arr from "effect/Array";
import type { HtmlBuilder } from "foldkit/html";

import type { Config } from "./registry.ts";

export type Resolved = Omit<Config, "stagger"> & {
  readonly staggerMs: number;
};

export type BreakpointEntry = readonly [number, SkeletonResult];

type BoneStyle = Parameters<HtmlBuilder<never>["Style"]>[0];

export const boneStyle = (
  bone: Bone,
  index: number,
  containerWidth: number,
  resolved: Resolved,
): BoneStyle => {
  const isCircle = bone.r === "50%" && Math.abs((bone.w / 100) * containerWidth - bone.h) < 4;

  const animations = [
    ...(resolved.animate === "pulse"
      ? [`boneyard-pulse ${resolved.speed} ease-in-out infinite`]
      : []),
    ...(resolved.animate === "shimmer"
      ? [`boneyard-shimmer ${resolved.speed} linear infinite`]
      : []),
    ...(resolved.staggerMs > 0
      ? [`boneyard-in 0.3s ease-out ${index * resolved.staggerMs}ms both`]
      : []),
  ];

  const style: BoneStyle = {
    position: "absolute",
    left: `${bone.x}%`,
    top: `${bone.y}px`,
    width: isCircle ? `${bone.h}px` : `${bone.w}%`,
    height: `${bone.h}px`,
    borderRadius: bone.r === "50%" ? "50%" : `${bone.r}px`,
    backgroundColor: resolved.color,
  };

  if (resolved.animate === "shimmer") {
    style.backgroundImage = `linear-gradient(${resolved.shimmerAngle}deg, ${resolved.color} 30%, ${resolved.shimmerColor} 50%, ${resolved.color} 70%)`;
    style.backgroundSize = "200% 100%";
  }

  if (Arr.isArrayNonEmpty(animations)) {
    style.animation = animations.join(",");
  }

  return style;
};

export const overlayCss = (
  name: string,
  entries: ReadonlyArray<BreakpointEntry>,
  resolved: Resolved,
): string => {
  const scope = `[data-boneyard="${name.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"]`;

  const layers = `${scope} > [data-boneyard-overlay] > [data-boneyard-bp]`;

  const rangeRules = Arr.map(entries, ([bp, result], index) => {
    const rules = `${layers}{display:none}${layers}:where([data-boneyard-bp="${bp}"]){display:block}${scope}[data-boneyard-loading]{min-height:${result.height}px}`;

    return index === 0 ? rules : `@media (min-width:${bp}px){${rules}}`;
  });

  const keyframes = [
    ...(resolved.animate === "shimmer"
      ? [
          "@keyframes boneyard-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}",
        ]
      : []),
    ...(resolved.animate === "pulse"
      ? ["@keyframes boneyard-pulse{0%,100%{opacity:1}50%{opacity:.45}}"]
      : []),
    ...(resolved.staggerMs > 0 ? ["@keyframes boneyard-in{from{opacity:0}to{opacity:1}}"] : []),
    "@media (prefers-reduced-motion:reduce){[data-boneyard] [data-boneyard-bone]{animation:none!important}}",
  ];

  return [...rangeRules, ...keyframes].join("\n");
};
