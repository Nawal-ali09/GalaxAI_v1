import { useState } from "react";

export const ChatInput = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() !== "") {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <div style={{ position: "absolute", bottom: 20, width: "100%", textAlign: "center" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        style={{ width: "40%", padding: "10px", fontSize: "16px" }}
      />
      <button onClick={handleSend} style={{ marginLeft: 10, padding: "10px 20px" }}>
        Send
      </button>
    </div>
  );
};
