import { lazy, Suspense, useEffect, useState } from "react";

const Game = lazy(() => import("@/components/game/Game"));

export default function App() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#06070b" }}>
      {mounted && (
        <Suspense fallback={<div style={{ color: "#c9952a", padding: 20, fontFamily: "monospace" }}>Carregando jogo…</div>}>
          <Game />
        </Suspense>
      )}
    </div>
  );
}
