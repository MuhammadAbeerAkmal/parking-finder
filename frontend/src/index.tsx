import React from "react";
import { createRoot } from "react-dom/client";
import { setWorkerUrl } from "maplibre-gl";
import App from "./App";

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