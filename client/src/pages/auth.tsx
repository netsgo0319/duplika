import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { MobileContainer } from "@/components/layout/mobile-container";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const {
    user,
    login,
    register,
    loginError,
    registerError,
    isLoggingIn,
    isRegistering,
  } = useAuth();

  if (user) {
    return <Redirect to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login({ username, password });
      } else {
        await register({ username, password });
      }
    } catch {
      // Errors are available via loginError/registerError
    }
  };

  const error = isLogin ? loginError : registerError;
  const isPending = isLogin ? isLoggingIn : isRegistering;

  return (
    <MobileContainer>
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Duplika</h1>
            <p className="text-gray-500">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error.message.includes(":") ? error.message.split(": ").slice(1).join(": ") : error.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {isPending
                ? "Loading..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-black font-medium underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </MobileContainer>
  );
}
