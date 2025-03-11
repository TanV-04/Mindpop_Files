import { useCallback, useEffect, useRef, useState } from "react";

const isKeyboardCodeAllowed = (code) => {
  return (
    code.startsWith("Key") ||
    code.startsWith("Digit") ||
    code === "Backspace" ||
    code === "Space"
  );
};

const useTypings = (enabled) => {
  const [cursor, setCursor] = useState(0);
  const [typed, setTyped] = useState("");
  const totalTyped = useRef(0);

  const keydownHandler = useCallback(
    ({ key, code }) => {
      if (!enabled || !isKeyboardCodeAllowed(code)) {
        return;
      }

      switch (key) {
        case "Backspace":
          setTyped((prev) => prev.slice(0, -1));
          setCursor((prev) => prev - 1);
          totalTyped.current -= 1;
          break;
        default:
          setTyped((prev) => prev.concat(key));
          setCursor((prev) => prev + 1);
          totalTyped.current += 1;
      }
    },
    [enabled] // `cursor` does not need to be in the dependency array
  );

  const clearTyped = useCallback(() => {
    setTyped("");
    setCursor(0);
    totalTyped.current = 0; // Reset totalTyped here
  }, []);

  // Effect to listen for keyboard events
  useEffect(() => {
    if (enabled) {
      window.addEventListener("keydown", keydownHandler);
    } else {
      window.removeEventListener("keydown", keydownHandler);
    }

    return () => {
      window.removeEventListener("keydown", keydownHandler);
    };
  }, [keydownHandler, enabled]);

  return {
    typed,
    cursor,
    clearTyped,
    totalTyped: totalTyped.current,
  };
};

export default useTypings;
