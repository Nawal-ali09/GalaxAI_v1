import { Environment, Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Avatar } from "./Avatar";

export const Experience = ({ scriptCommand }) => {
  const starsRef = useRef();

  // Rotate stars slowly
  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002; // Adjust speed here
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      
      {/* Rotating stars */}
      <Stars
        ref={starsRef}
        radius={100}
        depth={50}
        count={5000}
        factor={3}
        saturation={0}
        fade
      />

      <Environment preset="night" />
      
      <Avatar position={[0, -3.35, 6.8]} scale={2} scriptCommand={scriptCommand} />
    </>
  );
};
