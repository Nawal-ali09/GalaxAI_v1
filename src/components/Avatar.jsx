// Avatar.jsx
import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import AvatarParticles from "./AvatarParticles";

const corresponding = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

export function Avatar(props) {
  const {
    playAudio,
    script,
    headFollow,
    smoothMorphTarget,
    morphTargetSmoothing,
  } = useControls({
    playAudio: false,
    headFollow: true,
    script: {
      value: "HelloGalax",
      options: ["HelloGalax", "AboutGalax"],
    },
  });

  const audio = useMemo(() => new Audio(`/audios/${script}.mp3`), [script]);
  const jsonFile = useLoader(THREE.FileLoader, `audios/${script}.json`);
  const lipsync = JSON.parse(jsonFile);

  const group = useRef();
  const { nodes } = useGLTF("/models/646d9dcdc8a5f5bddbfac913.glb");
  const { animations: idleAnimation } = useFBX("/animations/Idle.fbx");
  const { animations: angryAnimation } = useFBX("/animations/Angry Gesture.fbx");
  const { animations: greetingAnimation } = useFBX("/animations/Standing Greeting.fbx");

  idleAnimation[0].name = "Idle";
  angryAnimation[0].name = "Angry";
  greetingAnimation[0].name = "Greeting";

  const [animation, setAnimation] = useState("Idle");
  const { actions } = useAnimations(
    [idleAnimation[0], angryAnimation[0], greetingAnimation[0]],
    group
  );

  // --- Handle animations ---
  useEffect(() => {
    actions[animation].reset().fadeIn(0.5).play();
    return () => actions[animation].fadeOut(0.5);
  }, [animation]);

  // --- Play audio and lipsync ---
  useEffect(() => {
    nodes.Wolf3D_Head.morphTargetInfluences[
      nodes.Wolf3D_Head.morphTargetDictionary["viseme_I"]
    ] = 1;
    nodes.Wolf3D_Teeth.morphTargetInfluences[
      nodes.Wolf3D_Teeth.morphTargetDictionary["viseme_I"]
    ] = 1;

    if (playAudio) {
      audio.play();
      if (script === "HelloGalax") setAnimation("Greeting");
    } else {
      setAnimation("Idle");
      audio.pause();
    }
  }, [playAudio, script]);

  // --- Main frame loop ---
 // Main frame loop for head follow and lipsync
  useFrame((state) => {
    const delta = state.clock.getDelta();
    const currentAudioTime = audio.currentTime;
    const smoothingFactor = 100;

    // Head follows camera
    if (group.current) {
      group.current.getObjectByName("Head")?.lookAt(state.camera.position);
    }

    // Lipsync
    if (!audio.paused && !audio.ended) {
      Object.values(corresponding).forEach((value) => {
        const index = nodes.Wolf3D_Head.morphTargetDictionary[value];
        const lerpFactor = 1 - Math.exp(-smoothingFactor * delta);
        nodes.Wolf3D_Head.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          nodes.Wolf3D_Head.morphTargetInfluences[index],
          0,
          lerpFactor
        );
        nodes.Wolf3D_Teeth.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          nodes.Wolf3D_Teeth.morphTargetInfluences[index],
          0,
          lerpFactor
        );
      });

      for (let cue of lipsync.mouthCues) {
        if (currentAudioTime >= cue.start && currentAudioTime <= cue.end) {
          const targetValue = corresponding[cue.value];
          const index = nodes.Wolf3D_Head.morphTargetDictionary[targetValue];
          const lerpFactor = 1 - Math.exp(-smoothingFactor * delta);
          nodes.Wolf3D_Head.morphTargetInfluences[index] = THREE.MathUtils.lerp(
            nodes.Wolf3D_Head.morphTargetInfluences[index],
            1,
            lerpFactor
          );
          nodes.Wolf3D_Teeth.morphTargetInfluences[index] = THREE.MathUtils.lerp(
            nodes.Wolf3D_Teeth.morphTargetInfluences[index],
            0.8,
            lerpFactor
          );
          break;
        }
      }
    } else {
      setAnimation("Idle");
    }
  });

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <AvatarParticles nodes={nodes} />
    </group>
  );
}

useGLTF.preload("/models/646d9dcdc8a5f5bddbfac913.glb");
