import { useSetAtom } from "jotai";
import { useMobile } from "../hooks/useMobile";
import {
  downArrowAtom,
  leftArrowAtom,
  rightArrowAtom,
  upArrowAtom,
} from "../utilities/utilities";

export const MobileControls = () => {
  const { isMobile } = useMobile();

  const setUpArrow = useSetAtom(upArrowAtom);
  const setDownArrow = useSetAtom(downArrowAtom);
  const setLeftArrow = useSetAtom(leftArrowAtom);
  const setRightArrow = useSetAtom(rightArrowAtom);

  const handleClick = (arrow) => {
    switch (arrow) {
      case "up":
        setUpArrow(true);
        setDownArrow(false);
        setLeftArrow(false);
        setRightArrow(false);
        break;
      case "down":
        setDownArrow(true);
        setUpArrow(false);
        setLeftArrow(false);
        setRightArrow(false);
        break;
      case "left":
        setLeftArrow(true);
        setUpArrow(false);
        setDownArrow(false);
        setRightArrow(false);
        break;
      case "right":
        setRightArrow(true);
        setUpArrow(false);
        setDownArrow(false);
        setLeftArrow(false);
        break;
      default:
        setRightArrow(false);
        setUpArrow(false);
        setDownArrow(false);
        setLeftArrow(false);
        break;
    }
  };

  if (!isMobile) return null;

  return (
    <div className={`mobile-controls ${isMobile ? "" : "hidden"}`}>
      <button onClick={() => handleClick("up")} className="arrow-button btn-up">
        <i className="arrow up"></i>
      </button>
      <button
        onClick={() => handleClick("left")}
        className="arrow-button btn-left"
      >
        <i className="arrow left"></i>
      </button>
      <button
        onClick={() => handleClick("down")}
        className="arrow-button btn-down"
      >
        <i className="arrow down"></i>
      </button>
      <button
        onClick={() => handleClick("right")}
        className="arrow-button btn-right"
      >
        <i className="arrow right"></i>
      </button>
    </div>
  );
};
