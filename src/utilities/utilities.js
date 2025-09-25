import { atom } from "jotai";
import { Projects } from "../config";

export const projectAtom = atom(Projects[0]);
export const isClickedAtom = atom(false);
export const cameraAtom = atom(null);
export const leftArrowAtom = atom(false);
export const rightArrowAtom = atom(false);
export const upArrowAtom = atom(false);
export const downArrowAtom = atom(false);
export const dayThemeAtom = atom(true);

export const Controls = {
  forward: "forward",
  back: "back",
  left: "left",
  right: "right",
  respawn: "respawn",
};
