import { useEffect, useRef, useState } from "react";

export const MusicToggle = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const a = new Audio("/audio/nature.mp3");
    a.loop = true;
    a.preload = "auto";
    a.volume = 0.5;
    audioRef.current = a;
    return () => a.pause();
  }, []);

  const onToggle = () => {
    const a = audioRef.current;
    if (!a) return;

    if (isPlaying) {
      a.pause();
    } else {
      a.play();
    }

    setIsPlaying((prev) => !prev);
  };
  return (
    <div
      className={`toggle-container music ${isPlaying ? "" : "is-paused"}`}
      onClick={onToggle}
    >
      <div className="wrapper">
        <div className="bar bar1"></div>
        <div className="bar bar2"></div>
        <div className="bar bar3"></div>
        <div className="bar bar4"></div>
        <div className="bar bar5"></div>
        <div className="bar bar6"></div>
        <div className="bar bar7"></div>
      </div>
    </div>
  );
};
