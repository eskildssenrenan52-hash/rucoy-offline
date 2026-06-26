import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles.css";

const Game = lazy(() => import("./components/game/Game"));
const queryClient = new QueryClient();

// IMPORTANT: this wrapper MUST have an explicit size. The TitleScreen uses
// `absolute inset-0`, which collapses to 0px if the parent has no height —
// causing a white screen after the user leaves the LoginPanel (which uses
// `fixed inset-0` and is the only reason the auth screen renders fine).
const shellStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
  background: "#06070b",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <div style={shellStyle}>
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                background: "#0f172a",
                color: "#fff",
                fontFamily: "sans-serif",
              }}
            >
              Carregando...
            </div>
          }
        >
          <Game />
        </Suspense>
      </div>
    </QueryClientProvider>
  </StrictMode>,
);
