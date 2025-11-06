import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api";

export default function SignIn() {
  const [error, setError] = useState("");
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  if (!authContext) {
    throw new Error("SignIn must be used within AuthProvider");
  }

  const { login } = authContext;

  const handleSignIn = async (email: string, password: string) => {
    try {
      const data = await loginUser(email, password);
      login(data.token);
      navigate("/");
    } catch (error: any) {
      setError(error?.message || "Неправильні дані для входу");
    }
  };

  return (
    <>
      <PageMeta title="Sign In" description="User sign in page" />
      <AuthLayout>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <SignInForm onSubmit={handleSignIn} />
      </AuthLayout>
    </>
  );
}
