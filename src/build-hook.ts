import * as P from "effect/Predicate";

const target: unknown = globalThis;

export const isBoneyardBuild = (): boolean =>
  !P.isUndefined(globalThis.window) &&
  P.hasProperty(target, "__BONEYARD_BUILD") &&
  target.__BONEYARD_BUILD === true;
