import React, { useEffect, useRef } from "react";
import { createRoot } from 'react-dom/client';
import App from "./App";
import reportWebVitals from "./reportWebVitals";

export default function Home() {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current && typeof document !== "undefined") {
      const domNode = document.getElementById('root');
      const root = createRoot(domNode);
      root.render(<App />);
      rootRef.current = root;
    }
  }, []);

  return <div id="root"></div>; // Ensure there's a container for React to render into
}
