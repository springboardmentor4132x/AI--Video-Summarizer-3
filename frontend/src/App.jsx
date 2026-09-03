import React, { useState, useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AuthLayout from "./components/AuthLayout";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import VideoUploader from "./components/VideoUploader";

function MainApp() {
  const { user } = useContext(AuthContext) || {};
  const [view, setView] = useState("login");

  if (!user) {
    return (
      <AuthLayout>
        {view === "login" ? (
          <LoginForm onSwitchToRegister={() => setView("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setView("login")} />
        )}
      </AuthLayout>
    );
  }

  return <VideoUploader />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
