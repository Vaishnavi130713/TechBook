
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import "./index.css";
import App from "./App.jsx";

const cognitoAuthConfig = {
  authority:
    "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_wtjzGnp4H",
  client_id: "19v6ogi9kek56dvbr40aestrnh",
  redirect_uri: "http://localhost:5175/",
  response_type: "code",
  scope: "openid email",

  onSigninCallback: () => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + window.location.hash
    );
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>
);
