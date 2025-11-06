import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const LogoutButton: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("LogoutButton must be used within AuthProvider");
  }

  const { logout } = authContext;

  return (
    <button
      onClick={logout}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
