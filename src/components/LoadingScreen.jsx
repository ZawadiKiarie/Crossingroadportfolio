import { useProgress } from "@react-three/drei";
import { useState } from "react";

export const LoadingScreen = () => {
  const { progress, _active } = useProgress();
  const [hidden, setHidden] = useState(false);
  return (
    <div className={`loading-screen ${hidden ? "loading-screen--hidden" : ""}`}>
      <div className="loading-screen__container">
        <div>
          <h1 className="loading-screen__title">Zawadi Kiarie's</h1>
          <h2 className="loading-screen__subtitle">Portfolio</h2>
        </div>
        <div className="progress__container">
          <div
            className="progress__bar"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="instructions__container">
          <div className="instructions">
            Use Up, Down, Left, Right Keys (or W, A, S, D keys) to navigate the
            sceness!
          </div>
          <button className="button-entry" onClick={() => setHidden(true)}>
            Understood. Let me in!
          </button>
        </div>
      </div>
    </div>
  );
};
