"use client";

import { createContext, useContext, useState } from "react";
import { ReactLenis } from "lenis/react";

const IntroContext = createContext({ ready: false, setReady: () => {} });

export const useIntro = () => useContext(IntroContext);

export default function IntroProvider({ children }) {
  const [ready, setReady] = useState(false);
  return (
    <IntroContext.Provider value={{ ready, setReady }}>
      <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, anchors: true }}>
        {children}
      </ReactLenis>
    </IntroContext.Provider>
  );
}
