import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Modal } from "./components/modal";
import { useAtom } from "jotai";
import { Controls, isClickedAtom, projectAtom } from "./utilities/utilities";
import { useSetAtom } from "jotai";
import { useMemo } from "react";
import { KeyboardControls } from "@react-three/drei";
import { LoadingScreen } from "./components/LoadingScreen";
import { MobileControls } from "./components/MobileControls";
import { ThemeToggle } from "./components/Themetoggle";
import { MusicToggle } from "./components/MusicToggle";

function App() {
  const [project] = useAtom(projectAtom);
  const setIsClicked = useSetAtom(isClickedAtom);

  const map = useMemo(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.respawn, keys: ["KeyR"] },
    ],
    []
  );
  return (
    <>
      <LoadingScreen />
      <div className="experience">
        <KeyboardControls map={map}>
          <Canvas
            onPointerMissed={() => setIsClicked(false)}
            className="experience-canvas"
            shadows
          >
            <Experience />
          </Canvas>
        </KeyboardControls>
      </div>
      <MusicToggle />
      <ThemeToggle />
      <Modal
        title={project.title}
        description={project.description}
        link={project.link}
      />
      <MobileControls />
    </>
  );
}

export default App;
