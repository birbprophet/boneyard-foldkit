import type { ResponsiveBones } from "boneyard-js";
import * as Arr from "effect/Array";
import * as MutableHashMap from "effect/MutableHashMap";
import type * as Option from "effect/Option";
import * as R from "effect/Record";

export type Animate = "shimmer" | "pulse" | "solid";

type AnimationConfig = {
  readonly animate: Animate;
  readonly speed: string;
  readonly shimmerAngle: number;
  readonly stagger: number | false;
};

type ColorConfig = {
  readonly color: string;
  readonly shimmerColor: string;
};

export type Config = AnimationConfig & ColorConfig;

type RegistryState = {
  config: Config;
};

const state: RegistryState = {
  config: {
    animate: "shimmer",
    color: "#f0f0f0",
    shimmerColor: "#f7f7f7",
    speed: "2s",
    shimmerAngle: 110,
    stagger: false,
  },
};

export const configureBoneyard = (partial: Partial<Config>): void => {
  state.config = { ...state.config, ...partial };
};

export const getBoneyardConfig = (): Config => state.config;

const bonesRegistry = MutableHashMap.empty<string, ResponsiveBones>();

export const registerBones = (bones: Record<string, ResponsiveBones>): void => {
  Arr.forEach(R.toEntries(bones), ([name, result]) => {
    MutableHashMap.set(bonesRegistry, name, result);
  });
};

export const getRegisteredBones = (name: string): Option.Option<ResponsiveBones> =>
  MutableHashMap.get(bonesRegistry, name);
