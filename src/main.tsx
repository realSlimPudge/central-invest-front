import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import "./app/styles/index.css";
import App from "./app/App.tsx";

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
