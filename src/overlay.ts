import { normalizeBone } from "boneyard-js";
import type { ResponsiveBones } from "boneyard-js";
import * as Arr from "effect/Array";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import type { Html, HtmlBuilder } from "foldkit/html";

import { boneStyle, overlayCss, type BreakpointEntry, type Resolved } from "./overlay-css.ts";

export const view = <Message>(
  h: HtmlBuilder<Message>,
  name: string,
  bones: ResponsiveBones,
  resolved: Resolved,
): Html => {
  const entries = Arr.sort(
    Arr.map(R.toEntries(bones.breakpoints), ([key, result]): BreakpointEntry => [
      Number(key),
      result,
    ]),
    Order.mapInput(Order.Number, (entry: BreakpointEntry) => entry[0]),
  );

  const layers = Arr.map(entries, ([bp, result]) =>
    h.div(
      [h.DataAttribute("boneyard-bp", String(bp)), h.Style({ position: "absolute", inset: "0" })],
      Arr.map(
        Arr.filterMap(result.bones, (raw) => {
          const bone = normalizeBone(raw);

          return bone.c === true ? Result.failVoid : Result.succeed(bone);
        }),
        (bone, index) =>
          h.div([
            h.DataAttribute("boneyard-bone", "true"),
            h.Style(boneStyle(bone, index, result.width, resolved)),
          ]),
      ),
    ),
  );

  return h.div(
    [
      h.DataAttribute("boneyard-overlay", "true"),
      h.AriaHidden(true),
      h.Style({
        position: "absolute",
        inset: "0",
        overflow: "hidden",
        pointerEvents: "none",
      }),
    ],
    [...layers, h.style([], [overlayCss(name, entries, resolved)])],
  );
};
