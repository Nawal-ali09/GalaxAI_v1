// import { Environment } from "@react-three/drei";
// import { useThree } from "@react-three/fiber";
// import { Avatar } from "./Avatar";

// export const Experience = () => {
//   const viewport = useThree((state) => state.viewport);

//   return (
//     <>
//       {/* Set black background */}
//       <color attach="background" args={["#000000"]} />

//       <Avatar position={[0, -3.35, 6.8]} scale={2} />
//       <Environment preset="sunset" />
//     </>
//   );
// };



import * as THREE from "three";
import { useEffect, useRef } from "react";
import { Environment, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Avatar } from "./Avatar";

export const Experience = () => {
  const { scene } = useThree();
  const videoRef = useRef();

  useEffect(() => {
    // Create video element
    const video = document.createElement("video");
    video.src = "/textures/background.mp4"; // your video path
    video.crossOrigin = "Anonymous";
    video.loop = true;
    video.muted = true;
    video.play();

    // Create video texture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    // Set as scene background
    scene.background = videoTexture;

    // Save video reference (optional)
    videoRef.current = video;

    return () => {
      scene.background = null; // cleanup on unmount
      video.pause();
    };
  }, [scene]);

  return (
    <>
      <Avatar position={[0, -3.35, 6.8]} scale={2} />
      <Environment preset="sunset" />
    </>
  );
};
