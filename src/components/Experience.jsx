import { OrbitControls, OrthographicCamera, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useMobile } from "../hooks/useMobile";
import { useAtomValue, useSetAtom } from "jotai";
import { cameraAtom, dayThemeAtom } from "../utilities/utilities";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import * as THREE from "three";
import { PortfolioModel } from "./Portfolio";

gsap.registerPlugin(useGSAP);

export const Experience = () => {
  const { scaleFactor } = useMobile();

  const camera = useRef();
  const ambientLight = useRef();
  const directionalLight = useRef();

  const setCamera = useSetAtom(cameraAtom);
  const dayTheme = useAtomValue(dayThemeAtom);

  useEffect(() => {
    setCamera(camera.current);
  }, [setCamera]);

  useEffect(() => {
    if (!ambientLight.current || !directionalLight.current) return;

    const ambTarget = new THREE.Color(dayTheme ? 0xffffff : 0x307893);
    const dirIntensityTarget = dayTheme ? 1.5 : 1;

    const tl = gsap.timeline({
      defaults: {
        duration: 1,
        ease: "power2.out",
      },
    });

    tl.to(
      ambientLight.current.color,
      {
        r: ambTarget.r,
        g: ambTarget.g,
        b: ambTarget.b,
      },
      0
    );
    tl.to(
      directionalLight.current,
      {
        intensity: dirIntensityTarget,
      },
      0
    );

    return () => tl.kill();
  }, [dayTheme]);

  useFrame(() => {
    // console.log(camera.current.position);
  });

  return (
    <>
      <OrthographicCamera
        ref={camera}
        makeDefault
        position={[12.92, 265.56, 332.34]}
        zoom={7.2 + scaleFactor * 2.89}
        // left={-aspect * 50}
        // right={aspect * 50}
        // top={50}
        // bottom={-50}
        near={1}
        far={1000}
      />
      <OrbitControls enabled={false} />
      <ambientLight ref={ambientLight} intensity={3} />
      <directionalLight
        ref={directionalLight}
        castShadow
        intensity={1.5}
        position={[200, 300, 200]}
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
        shadow-camera-near={1}
        shadow-camera-far={1000}
        shadow-bias={-0.0005}
      />
      <PortfolioModel />
    </>
  );
};

useGLTF.preload("/models/crossingRoadPortfolio.glb");
