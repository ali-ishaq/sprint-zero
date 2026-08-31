import { useEffect, useState } from "react";
import { apiUrl } from "../lib/api";
import LandingPage from "./LandingPage";
import { GoogleIcon } from "./ui/Icons";
import logo from "../../assets/logo.png";

export default function Login() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error");
    const message = params.get("message");

    if (authError) {
      setError(message || getErrorMessage(authError));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setLoading(false);
  }, []);

  const getErrorMessage = (code) => {
    switch (code) {
      case "access_denied":
        return "Access was denied. Please allow the requested permissions.";
      case "no_code":
        return "Authentication failed. Please try again.";
      case "no_refresh_token":
        return "Please sign in again and grant offline access.";
      case "invalid_grant":
        return "Session expired. Please sign in again.";
      case "callback_failed":
        return "Authentication failed. Please try again.";
      default:
        return "An error occurred during authentication.";
    }
  };

  const handleLogin = () => {
    window.location.href = apiUrl("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {error ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FC] px-4">
          <div className="w-full max-w-[450px] bg-white rounded-[20px] border border-line p-12 shadow-card text-center">
            <img
              src={logo}
              alt="SprintZero logo"
              className="w-16 h-16 rounded-[16px] mb-5 mx-auto"
            />
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Sign-in unsuccessful
            </h1>
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
            <button
              onClick={handleLogin}
              className="mt-6 w-full flex items-center justify-center gap-3 py-3 px-4 bg-brand text-white font-medium rounded-lg hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand/60 focus:ring-offset-2 transition-colors"
            >
              <GoogleIcon className="w-5 h-5" />
              Try again
            </button>
          </div>
        </div>
      ) : (
        <LandingPage onSignIn={handleLogin} />
      )}
    </div>
  );
}
