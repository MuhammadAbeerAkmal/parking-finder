import React from "react";
import { createRoot } from "react-dom/client";
import { setWorkerUrl } from "maplibre-gl";
import App from "./App";
import "./app.css";

// Must happen before any Map is created. The worker file is copied verbatim
// into the build output by CopyWebpackPlugin (see webpack.config.js) rather
// than imported as a module, so this is a plain served path, not an import.
setWorkerUrl("/maplibre-gl-worker.mjs");

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(<App />);

// Only actually exists in production builds (see webpack.config.js) - a
// no-op 404 in dev, not worth branching on here.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      /* not present in dev builds - expected */
    });
  });
}
