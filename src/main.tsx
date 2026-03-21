import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import "./app/styles/index.css";
import App from "./app/App.tsx";

const storedTheme = (() => {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
})();

if (storedTheme === "dark") {
  document.documentElement.classList.add("dark");
} else if (storedTheme === "light") {
  document.documentElement.classList.remove("dark");
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
