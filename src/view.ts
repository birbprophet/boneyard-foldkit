import * as Option from "effect/Option";
import type { Html, HtmlBuilder } from "foldkit/html";

import { isBoneyardBuild } from "./build-hook.ts";
import type { Resolved } from "./overlay-css.ts";
import * as Overlay from "./overlay.ts";
import { type Animate, getBoneyardConfig, getRegisteredBones } from "./registry.ts";

type PropsBase = {
  readonly name: string;
  readonly loading: boolean;
  readonly children?: ReadonlyArray<Html | string>;
  readonly label?: string;
  readonly className?: string;
};

type PropsAppearance = {
  readonly animate?: Animate;
  readonly color?: string;
  readonly shimmerColor?: string;
  readonly shimmerAngle?: number;
  readonly speed?: string;
  readonly stagger?: number | false;
};

export type Props = PropsBase & PropsAppearance;

/**
 * @cc [owner:birbprophet,label:localization] boneyard-caller-label
 * While `loading`, the wrapper exposes `role="status"`; its accessible name
 * MUST come from the caller's `label` prop (localized). No implicit label.
 */
export const view = <Message>(props: Props, h: HtmlBuilder<Message>): Html => {
  const config = getBoneyardConfig();

  const bones = getRegisteredBones(props.name);

  const loading = props.loading && !isBoneyardBuild();

  const stagger = props.stagger ?? config.stagger;

  const resolved: Resolved = {
    animate: props.animate ?? config.animate,
    color: props.color ?? config.color,
    shimmerColor: props.shimmerColor ?? config.shimmerColor,
    shimmerAngle: props.shimmerAngle ?? config.shimmerAngle,
    speed: props.speed ?? config.speed,
    staggerMs: stagger === false ? 0 : stagger,
  };

  const showSkeleton = loading && Option.isSome(bones);

  const content = h.div(
    [
      h.DataAttribute("boneyard-content", "true"),
      ...(showSkeleton ? [h.AriaHidden(true), h.Style({ visibility: "hidden" })] : []),
    ],
    props.children,
  );

  return h.div(
    [
      h.DataAttribute("boneyard", props.name),
      ...(props.className === undefined ? [] : [h.Class(props.className)]),
      h.Style({ position: "relative" }),
      ...(loading
        ? [
            h.AriaBusy(true),
            h.AriaLive("polite"),
            h.DataAttribute("boneyard-loading", ""),
            h.Role("status"),
          ]
        : []),
      ...(loading && props.label !== undefined ? [h.AriaLabel(props.label)] : []),
    ],
    [content, ...(showSkeleton ? [Overlay.view(h, props.name, bones.value, resolved)] : [])],
  );
};
