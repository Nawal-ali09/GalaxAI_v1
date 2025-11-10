import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function AvatarParticles({ nodes }) {
  const particlesRef = useRef([]);

  const circleTexture = new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/sprites/circle.png"
  );

  // Store original geometry positions for breathing effect
  useEffect(() => {
    particlesRef.current = [
      nodes.Wolf3D_Body,
      nodes.Wolf3D_Outfit_Bottom,
      nodes.Wolf3D_Outfit_Footwear,
      nodes.Wolf3D_Outfit_Top,
      nodes.Wolf3D_Hair,
      nodes.Wolf3D_Head,
      nodes.Wolf3D_Teeth,
      nodes.EyeLeft,
      nodes.EyeRight,
    ].map((part) => part.geometry.attributes.position.array.slice());
  }, [nodes]);

  // Apply breathing motion
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    particlesRef.current.forEach((original, idx) => {
      const part = [
        nodes.Wolf3D_Body,
        nodes.Wolf3D_Outfit_Bottom,
        nodes.Wolf3D_Outfit_Footwear,
        nodes.Wolf3D_Outfit_Top,
        nodes.Wolf3D_Hair,
        nodes.Wolf3D_Head,
        nodes.Wolf3D_Teeth,
        nodes.EyeLeft,
        nodes.EyeRight,
      ][idx];

      const positions = part.geometry.attributes.position.array;

      for (let i = 0; i < positions.length; i += 10) {
        positions[i] = original[i] + 0.002 * Math.sin(time + i * 0.01);
        positions[i + 1] = original[i + 1] + 0.002 * Math.sin(time + i * 0.01);
        positions[i + 2] = original[i + 2] + 0.002 * Math.sin(time + i * 0.01);
      }

      part.geometry.attributes.position.needsUpdate = true;
    });
  });

  // Render particles
  return (
    <>
      {[
        nodes.Wolf3D_Body,
        nodes.Wolf3D_Outfit_Bottom,
        nodes.Wolf3D_Outfit_Footwear,
        nodes.Wolf3D_Outfit_Top,
        nodes.Wolf3D_Hair,
        nodes.Wolf3D_Head,
        nodes.Wolf3D_Teeth,
        nodes.EyeLeft,
        nodes.EyeRight,
      ].map((part, i) => (
        <points
          key={i}
          geometry={part.geometry}
          skeleton={part.skeleton}
          morphTargetDictionary={part.morphTargetDictionary}
          morphTargetInfluences={part.morphTargetInfluences}
        >
          <pointsMaterial
            size={0.005}
            color="#ffffff"
            transparent
            opacity={100}
            depthWrite={false}
            alphaMap={circleTexture}
            alphaTest={0.0}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </>
  );
}
