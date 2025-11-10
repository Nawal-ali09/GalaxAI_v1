import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
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

export function Avatar({ scriptCommand, ...props }) {
  const group = useRef();

  // Load GLTF model
  const { nodes } = useGLTF("/models/646d9dcdc8a5f5bddbfac913.glb");

  // Return nothing if model isn't loaded yet
  if (!nodes) return null;

  // Load animations
  const { animations: idleAnimation } = useFBX("/animations/Idle.fbx");
  const { animations: angryAnimation } = useFBX("/animations/Angry Gesture.fbx");
  const { animations: greetingAnimation } = useFBX("/animations/Standing Greeting.fbx");

  idleAnimation[0].name = "Idle";
  angryAnimation[0].name = "Angry";
  greetingAnimation[0].name = "Greeting";

  const { actions } = useAnimations(
    [idleAnimation[0], angryAnimation[0], greetingAnimation[0]],
    group
  );

  const [animation, setAnimation] = useState("Idle");
  const [audio, setAudio] = useState(null);
  const [lipsyncCues, setLipsyncCues] = useState([]);

  // --- Handle animation switching ---
  useEffect(() => {
    actions[animation]?.reset().fadeIn(0.5).play();
    return () => actions[animation]?.fadeOut(0.5);
  }, [animation]);

  // --- Chat-triggered audio + lipsync ---
  useEffect(() => {
    if (!scriptCommand) return;

    // Stop previous audio
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    let audioToPlay = null;
    let jsonFile = null;

    if (scriptCommand === "hello") {
      audioToPlay = new Audio("/audios/HelloGalax.mp3");
      jsonFile = "/audios/HelloGalax.json";
      setAnimation("Greeting");
    } else if (scriptCommand === "about") {
      audioToPlay = new Audio("/audios/AboutGalax.mp3");
      jsonFile = "/audios/AboutGalax.json";
      setAnimation("Greeting");
    } else {
      setAnimation("Idle");
    }

    if (audioToPlay && jsonFile) {
      setAudio(audioToPlay);

      // Load lipsync JSON
      fetch(jsonFile)
        .then((res) => res.json())
        .then((data) => setLipsyncCues(data.mouthCues || []));

      audioToPlay.play();
      audioToPlay.onended = () => {
        setAnimation("Idle");
        setLipsyncCues([]);
      };
    }
  }, [scriptCommand]);

  // --- Main frame loop for head follow and lipsync ---
  useFrame((state) => {
    if (!nodes || !audio) return;

    const delta = state.clock.getDelta();

    // Head follows camera
    if (group.current) {
      group.current.getObjectByName("Head")?.lookAt(state.camera.position);
    }

    // Lipsync
    if (!audio.paused && !audio.ended && lipsyncCues.length > 0) {
      const currentTime = audio.currentTime;
      const smoothingFactor = 100;

      // Reset all morph targets smoothly
      Object.values(corresponding).forEach((viseme) => {
        const index = nodes.Wolf3D_Head.morphTargetDictionary[viseme];
        nodes.Wolf3D_Head.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          nodes.Wolf3D_Head.morphTargetInfluences[index],
          0,
          1 - Math.exp(-smoothingFactor * delta)
        );
        nodes.Wolf3D_Teeth.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          nodes.Wolf3D_Teeth.morphTargetInfluences[index],
          0,
          1 - Math.exp(-smoothingFactor * delta)
        );
      });

      // Apply current cue
      for (let cue of lipsyncCues) {
        if (currentTime >= cue.start && currentTime <= cue.end) {
          const viseme = corresponding[cue.value];
          const index = nodes.Wolf3D_Head.morphTargetDictionary[viseme];
          nodes.Wolf3D_Head.morphTargetInfluences[index] = THREE.MathUtils.lerp(
            nodes.Wolf3D_Head.morphTargetInfluences[index],
            1,
            1 - Math.exp(-smoothingFactor * delta)
          );
          nodes.Wolf3D_Teeth.morphTargetInfluences[index] = THREE.MathUtils.lerp(
            nodes.Wolf3D_Teeth.morphTargetInfluences[index],
            0.8,
            1 - Math.exp(-smoothingFactor * delta)
          );
          break; // Only one cue active at a time
        }
      }
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
