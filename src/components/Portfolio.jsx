import { useCursor, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  cameraAtom,
  downArrowAtom,
  isClickedAtom,
  leftArrowAtom,
  projectAtom,
  rightArrowAtom,
  upArrowAtom,
} from "../utilities/utilities";
import { Projects } from "../config";
import { Octree } from "three/examples/jsm/Addons.js";
import { Capsule } from "three/examples/jsm/Addons.js";

const OFFSET = Math.PI / 2;

const GRAVITY = 30;
const CAPSULE_RADIUS = 0.35;
const CAPSULE_HEIGHT = 1;
const JUMP_HEIGHT = 15;
const MOVE_SPEED = 5;

export function PortfolioModel(props) {
  const { nodes, materials } = useGLTF("/models/Portfolio3.glb");

  const [hovered, setHovered] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const camera = useAtomValue(cameraAtom);
  const setProject = useSetAtom(projectAtom);
  const setIsClicked = useSetAtom(isClickedAtom);
  const upArrow = useAtomValue(upArrowAtom);
  const downArrow = useAtomValue(downArrowAtom);
  const leftArrow = useAtomValue(leftArrowAtom);
  const rightArrow = useAtomValue(rightArrowAtom);

  const setUpArrow = useSetAtom(upArrowAtom);
  const setDownArrow = useSetAtom(downArrowAtom);
  const setLeftArrow = useSetAtom(leftArrowAtom);
  const setRightArrow = useSetAtom(rightArrowAtom);

  useCursor(hovered);

  const group = useRef();
  const skirt = useRef();
  const strap = useRef();
  const character = useRef();
  const stepRef = useRef(null);

  const groundCollider = useRef();
  const playerVelocity = useRef(new THREE.Vector3());
  const playerOnFloor = useRef(false);
  const targetRotation = useRef(OFFSET);
  const spawnPosition = useRef(new THREE.Vector3());

  const cameraOffset = useMemo(
    () => new THREE.Vector3(156.89, 269.98, 334, 56),
    []
  );

  // Use memo so these aren’t recreated on each render
  const colliderOctree = useMemo(() => new Octree(), []);
  const playerCollider = useMemo(
    () =>
      new Capsule(
        new THREE.Vector3(0, CAPSULE_RADIUS, 0),
        new THREE.Vector3(0, CAPSULE_HEIGHT, 0),
        CAPSULE_RADIUS
      ),
    []
  );

  const [, getKeys] = useKeyboardControls();

  useLayoutEffect(() => {
    if (!group.current || !groundCollider.current || !character.current) return;
    group.current.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true;
        child.receiveShadow = true; // or only for floors if you want to optimize
      }
    });

    skirt.current.material.color = new THREE.Color("#000000");
    strap.current.material.color = new THREE.Color("#000000");

    spawnPosition.current.copy(character.current.position);

    // Initialize octree from ground collider
    colliderOctree.fromGraphNode(groundCollider.current);
    groundCollider.current.visible = false;

    // Set initial player position
    playerCollider.start
      .copy(character.current.position)
      .add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));
    playerCollider.end
      .copy(character.current.position)
      .add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));
  }, [colliderOctree, playerCollider]);

  useEffect(() => {
    const a = new Audio("/audio/footstep.mp3");
    a.volume = 0.01;
    stepRef.current = a;
  }, []);

  const playStep = () => {
    const a = stepRef.current;
    a.currentTime = 0;
    a.play();
  };

  const showModal = (id) => {
    const content = Projects[id];
    if (content) {
      setProject(content);
      setIsClicked(true);
    }
  };

  const clearMobileArrows = () => {
    setUpArrow(false);
    setDownArrow(false);
    setLeftArrow(false);
    setRightArrow(false);
  };

  const respawnCharacter = () => {
    character.current.position.copy(spawnPosition.current);
    targetRotation.current = OFFSET;
    playerCollider.start
      .copy(spawnPosition.current)
      .add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));
    playerCollider.end
      .copy(spawnPosition.current)
      .add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));

    playerVelocity.current.set(0, 0, 0);
    setIsMoving(false);
  };

  const playerCollisions = () => {
    const result = colliderOctree.capsuleIntersect(playerCollider);
    playerOnFloor.current = false;

    if (result) {
      playerOnFloor.current = result.normal.y > 0;
      playerCollider.translate(result.normal.multiplyScalar(result.depth));

      if (playerOnFloor.current) {
        setIsMoving(false);
        playerVelocity.current.x = 0;
        playerVelocity.current.z = 0;
      }
    }
  };

  const updatePlayer = () => {
    if (!character.current) return;

    if (character.current.position.y < -20) {
      respawnCharacter();
      return;
    }

    //gravity
    if (!playerOnFloor.current) {
      playerVelocity.current.y -= GRAVITY * 0.055;
    }

    //step
    playerCollider.translate(
      playerVelocity.current.clone().multiplyScalar(0.055)
    );

    //collide & slide
    playerCollisions();

    //sync visual
    character.current.position.copy(playerCollider.start);
    character.current.position.y -= CAPSULE_RADIUS;

    let rotationDiff =
      ((((targetRotation.current - character.current.rotation.y) %
        (2 * Math.PI)) +
        3 * Math.PI) %
        (2 * Math.PI)) -
      Math.PI;
    let finalRotation = character.current.rotation.y + rotationDiff;

    //rotate toward target
    character.current.rotation.y = THREE.MathUtils.lerp(
      character.current.rotation.y,
      finalRotation,
      0.4
    );
  };

  useFrame(() => {
    updatePlayer();

    if (character.current && camera) {
      const targetCameraPosition = new THREE.Vector3(
        character.current.position.x + cameraOffset.x,
        cameraOffset.y,
        character.current.position.z + cameraOffset.z
      );
      camera.position.copy(targetCameraPosition);
      camera.lookAt(
        character.current.position.x,
        camera.position.y - 265.56,
        character.current.position.z
      );
    }

    const { forward, back, left, right, respawn } = getKeys();

    if (respawn) {
      respawnCharacter();
      return;
    }

    if (isMoving || !character.current) return;

    if (
      !(
        forward ||
        back ||
        left ||
        right ||
        upArrow ||
        downArrow ||
        leftArrow ||
        rightArrow
      )
    )
      return;

    if (forward || upArrow) {
      playerVelocity.current.z -= MOVE_SPEED;
      targetRotation.current = 0;
    }
    if (back || downArrow) {
      playerVelocity.current.z += MOVE_SPEED;
      targetRotation.current = Math.PI;
    }
    if (left || leftArrow) {
      playerVelocity.current.x -= MOVE_SPEED;
      targetRotation.current = Math.PI / 2;
    }
    if (right || rightArrow) {
      playerVelocity.current.x += MOVE_SPEED;
      targetRotation.current = -Math.PI / 2;
    }

    playerVelocity.current.y = JUMP_HEIGHT;
    playStep();
    setIsMoving(true);
    clearMobileArrows();
  });

  return (
    <group {...props} dispose={null} ref={group}>
      <group name="Level" position={[0, 0.873, 0]}>
        <mesh
          name="Plane124"
          geometry={nodes.Plane124.geometry}
          material={materials.Grass}
        />
        <mesh
          name="Plane124_1"
          geometry={nodes.Plane124_1.geometry}
          material={materials["Path.002"]}
        />
        <mesh
          name="Plane124_2"
          geometry={nodes.Plane124_2.geometry}
          material={materials["Side white"]}
        />
        <mesh
          name="Plane124_3"
          geometry={nodes.Plane124_3.geometry}
          material={materials.Trunk}
        />
        <mesh
          name="Plane124_4"
          geometry={nodes.Plane124_4.geometry}
          material={materials["Tree Leaves"]}
        />
        <mesh
          name="Plane124_5"
          geometry={nodes.Plane124_5.geometry}
          material={materials["Tree Leave Dark"]}
        />
        <mesh
          name="Plane124_6"
          geometry={nodes.Plane124_6.geometry}
          material={materials["Material.002"]}
        />
        <mesh
          name="Plane124_7"
          geometry={nodes.Plane124_7.geometry}
          material={materials.soil}
        />
        <mesh
          name="Plane124_8"
          geometry={nodes.Plane124_8.geometry}
          material={materials.LEAVES}
        />
        <mesh
          name="Plane124_9"
          geometry={nodes.Plane124_9.geometry}
          material={materials["LEAVES DARK"]}
        />
        <mesh
          name="Plane124_10"
          geometry={nodes.Plane124_10.geometry}
          material={materials.TRUNK}
        />
        <mesh
          name="Plane124_11"
          geometry={nodes.Plane124_11.geometry}
          material={materials["point grass"]}
        />
        <mesh
          name="Plane124_12"
          geometry={nodes.Plane124_12.geometry}
          material={materials["Flower center"]}
        />
        <mesh
          name="Plane124_13"
          geometry={nodes.Plane124_13.geometry}
          material={materials.Petal}
        />
        <mesh
          name="Plane124_14"
          geometry={nodes.Plane124_14.geometry}
          material={materials.Stem}
        />
        <mesh
          name="Plane124_15"
          geometry={nodes.Plane124_15.geometry}
          material={materials["Petal.001"]}
        />
        <mesh
          name="Plane124_16"
          geometry={nodes.Plane124_16.geometry}
          material={materials["Stem.001"]}
        />
        <mesh
          name="Plane124_17"
          geometry={nodes.Plane124_17.geometry}
          material={materials["fence pole light"]}
        />
        <mesh
          name="Plane124_18"
          geometry={nodes.Plane124_18.geometry}
          material={materials["fence pole darker"]}
        />
        <mesh
          name="Plane124_19"
          geometry={nodes.Plane124_19.geometry}
          material={materials.bush}
        />
        <mesh
          name="Plane124_20"
          geometry={nodes.Plane124_20.geometry}
          material={materials["bush bottom"]}
        />
        <mesh
          name="Plane124_21"
          geometry={nodes.Plane124_21.geometry}
          material={materials["bush flower"]}
        />
        <mesh
          name="Plane124_22"
          geometry={nodes.Plane124_22.geometry}
          material={materials["bench side"]}
        />
        <mesh
          name="Plane124_23"
          geometry={nodes.Plane124_23.geometry}
          material={materials.Rock}
        />
        <mesh
          name="Plane124_24"
          geometry={nodes.Plane124_24.geometry}
          material={materials.Fountain}
        />
        <mesh
          name="Plane124_25"
          geometry={nodes.Plane124_25.geometry}
          material={materials.Water}
        />
        <mesh
          name="Plane124_26"
          geometry={nodes.Plane124_26.geometry}
          material={materials["Material.003"]}
        />
        <mesh
          name="Plane124_27"
          geometry={nodes.Plane124_27.geometry}
          material={materials.chicken}
        />
        <mesh
          name="Plane124_28"
          geometry={nodes.Plane124_28.geometry}
          material={materials["chicken feet"]}
        />
        <mesh
          name="Plane124_29"
          geometry={nodes.Plane124_29.geometry}
          material={materials["small beak"]}
        />
        <mesh
          name="Plane124_30"
          geometry={nodes.Plane124_30.geometry}
          material={materials.Material}
        />
        <mesh
          name="Plane124_31"
          geometry={nodes.Plane124_31.geometry}
          material={materials["big beak"]}
        />
        <mesh
          name="Plane124_32"
          geometry={nodes.Plane124_32.geometry}
          material={materials["inner sign"]}
        />
        <mesh
          name="Plane124_33"
          geometry={nodes.Plane124_33.geometry}
          material={materials.Text}
        />
      </group>
      <group
        onClick={() => showModal(0)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        name="Project1"
        position={[-71.719, 10.438, -83.472]}
        scale={[-8.818, -5.831, -1.154]}
      >
        <mesh
          name="Cube025"
          geometry={nodes.Cube025.geometry}
          material={materials.frame}
        />
        <mesh
          name="Cube025_1"
          geometry={nodes.Cube025_1.geometry}
          material={materials["project one"]}
        />
        <mesh
          name="Cube025_2"
          geometry={nodes.Cube025_2.geometry}
          material={materials.root}
        />
      </group>
      <group
        onClick={() => showModal(1)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        name="Project2"
        position={[-41.178, 10.438, -83.472]}
        scale={[-8.818, -5.831, -1.154]}
      >
        <mesh
          name="Cube035"
          geometry={nodes.Cube035.geometry}
          material={materials.frame}
        />
        <mesh
          name="Cube035_1"
          geometry={nodes.Cube035_1.geometry}
          material={materials.root}
        />
        <mesh
          name="Cube035_2"
          geometry={nodes.Cube035_2.geometry}
          material={materials["Project two"]}
        />
      </group>
      <group
        onClick={() => showModal(2)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        name="Project3"
        position={[-11.995, 10.438, -83.472]}
        scale={[-8.818, -5.831, -1.154]}
      >
        <mesh
          name="Cube036"
          geometry={nodes.Cube036.geometry}
          material={materials.frame}
        />
        <mesh
          name="Cube036_1"
          geometry={nodes.Cube036_1.geometry}
          material={materials["project one"]}
        />
        <mesh
          name="Cube036_2"
          geometry={nodes.Cube036_2.geometry}
          material={materials.root}
        />
      </group>
      <group
        ref={character}
        name="Character"
        position={[80.453, 0.086, 24.587]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.38, 0.496, 0.25]}
      >
        <mesh
          name="Cube009"
          geometry={nodes.Cube009.geometry}
          material={materials.Boots}
        />
        <mesh
          name="Cube009_1"
          geometry={nodes.Cube009_1.geometry}
          material={materials.Skin}
        />
        <mesh
          name="Cube009_2"
          geometry={nodes.Cube009_2.geometry}
          material={materials.shirt}
        />
        <mesh
          ref={strap}
          name="Cube009_3"
          geometry={nodes.Cube009_3.geometry}
          material={materials.strap}
        />
        <mesh
          name="Cube009_4"
          geometry={nodes.Cube009_4.geometry}
          material={materials.Hair}
        />
        <mesh
          ref={skirt}
          name="Cube009_5"
          geometry={nodes.Cube009_5.geometry}
          material={materials.skirt}
        />
        <mesh
          name="Cube009_6"
          geometry={nodes.Cube009_6.geometry}
          material={materials.Eye}
        />
      </group>
      <group
        onClick={() => showModal(3)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        name="Chest"
        position={[-90.16, 0.877, -70.638]}
        scale={[4.088, 2.413, 2.225]}
      >
        <mesh
          name="Plane012"
          geometry={nodes.Plane012.geometry}
          material={materials.Chest}
        />
        <mesh
          name="Plane012_1"
          geometry={nodes.Plane012_1.geometry}
          material={materials["chest strap"]}
        />
        <mesh
          name="Plane012_2"
          geometry={nodes.Plane012_2.geometry}
          material={materials["chest opening"]}
        />
      </group>
      <mesh
        ref={groundCollider}
        name="Ground_Collider"
        geometry={nodes.Ground_Collider.geometry}
        material={nodes.Ground_Collider.material}
        position={[0, 0.873, 0]}
      />
    </group>
  );
}

useGLTF.preload("/models/Portfolio3.glb");
