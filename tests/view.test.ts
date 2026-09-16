import { describe, it } from "@effect/vitest";
import type { ResponsiveBones } from "boneyard-js";
import type { Html } from "foldkit/html";
import * as Scene from "foldkit/scene";
import type * as Update from "foldkit/update";

import { configureBoneyard, registerBones, view } from "../src/index.ts";

type TestModel = { readonly unused: null };

type TestMessage = { readonly _tag: "Noop" };

const model: TestModel = { unused: null };

const update = (
  current: TestModel,
  _message: TestMessage,
): Update.Return<TestModel, TestMessage> => ({
  model: current,
});

const bones: ResponsiveBones = {
  breakpoints: {
    360: {
      name: "card",
      viewportWidth: 360,
      width: 320,
      height: 200,
      bones: [
        [2, 12, 60, 20, 6],
        [2, 44, 96, 12, 4],
        [80, 60, 5, 16, "50%"],
        [0, 100, 50, 8, 4, true],
      ],
    },
    1280: {
      name: "card",
      viewportWidth: 1280,
      width: 1200,
      height: 480,
      bones: [[4, 24, 40, 28, 8]],
    },
  },
};

describe("boneyard-foldkit view", () => {
  it("renders content without overlay when not loading", () => {
    Scene.scene(
      {
        update,
        view: (_model, h): Html =>
          view(
            {
              children: [h.p([], ["Real content"])],
              loading: false,
              name: "card",
            },
            h,
          ),
      },
      Scene.given(model),
      Scene.expect(Scene.selector('[data-boneyard="card"]')).toExist(),
      Scene.expect(Scene.selector("[data-boneyard-overlay]")).not.toExist(),
    );
  });

  it("overlays breakpoint bone layers while loading", () => {
    registerBones({ card: bones });

    Scene.scene(
      {
        update,
        view: (_model, h): Html =>
          view(
            {
              children: [h.p([], ["Real content"])],
              label: "Loading card",
              loading: true,
              name: "card",
            },
            h,
          ),
      },
      Scene.given(model),
      Scene.expect(Scene.selector('[data-boneyard="card"]')).toHaveAttr("role", "status"),
      Scene.expect(Scene.selector('[data-boneyard="card"]')).toHaveAttr("aria-busy", "true"),
      Scene.expect(Scene.selector('[data-boneyard="card"]')).toHaveAttr(
        "aria-label",
        "Loading card",
      ),
      Scene.expect(Scene.selector('[data-boneyard="card"]')).toHaveAttr("data-boneyard-loading"),
      Scene.expect(Scene.selector('[data-boneyard="card"] [data-boneyard-content]')).toHaveText(
        "Real content",
      ),
      Scene.expect(Scene.selector("[data-boneyard-content]")).toHaveStyle("visibility", "hidden"),
      Scene.expect(Scene.selector("[data-boneyard-overlay]")).toHaveAttr("aria-hidden", "true"),
      Scene.expect(Scene.selector('[data-boneyard="card"] [data-boneyard-bp="360"]')).toExist(),
      Scene.expect(Scene.selector('[data-boneyard="card"] [data-boneyard-bp="1280"]')).toExist(),
      Scene.expectAll(
        Scene.all.selector('[data-boneyard="card"] [data-boneyard-bone]'),
      ).toHaveCount(4),
      Scene.inside(
        Scene.selector('[data-boneyard-bp="360"]'),
        Scene.expectAll(Scene.all.selector("[data-boneyard-bone]")).toHaveCount(3),
        Scene.expect(Scene.nth(Scene.all.selector("[data-boneyard-bone]"), 2)).toHaveStyle(
          "width",
          "16px",
        ),
      ),
    );
  });

  it("skips container bones and falls back to children when unregistered", () => {
    registerBones({ card: bones });

    Scene.scene(
      {
        update,
        view: (_model, h): Html =>
          view(
            {
              children: [h.p([], ["Partial"])],
              loading: true,
              name: "missing-region",
            },
            h,
          ),
      },
      Scene.given(model),
      Scene.expect(Scene.text("Partial")).toExist(),
      Scene.expect(Scene.selector("[data-boneyard-overlay]")).not.toExist(),
    );
  });

  it("honours pulse animation config", () => {
    configureBoneyard({ animate: "pulse" });

    Scene.scene(
      {
        update,
        view: (_model, h): Html => view({ loading: true, name: "card" }, h),
      },
      Scene.given(model),
      Scene.expect(Scene.selector('[data-boneyard="card"] style')).toHaveText(
        /@keyframes boneyard-pulse/u,
      ),
    );

    configureBoneyard({ animate: "shimmer" });
  });
});
