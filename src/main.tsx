import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";

import "./styles/variables.css";
import "./styles/animations.css";
import "./styles/index.css";
import "./styles/navbar.css";
import "./styles/home.css";
import "./styles/composer.css";
import "./styles/drafts.css";
import "./styles/responsive.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
   <Provider store={store}>
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
</Provider>
  </React.StrictMode>
);