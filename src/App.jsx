import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { ChatInput } from "./components/ChatInput";
import { useState } from "react";

function App() {
  const [scriptCommand, setScriptCommand] = useState("");

  return (
    <>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
        <color attach="background" args={["#000000"]} />
        <Experience scriptCommand={scriptCommand} />
      </Canvas>
      <ChatInput onSend={(text) => setScriptCommand(text.toLowerCase())} />
    </>
  );
}

export default App;
