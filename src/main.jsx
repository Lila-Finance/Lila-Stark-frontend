import React from "react";
import ReactDOM from "react-dom/client";
import { StarknetProvider } from "./Provider";
import App from "./App";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <StarknetProvider>
    <App />
  </StarknetProvider>
)