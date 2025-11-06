// AuthPageLayout.tsx
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative p-6 bg-white dark:bg-gray-900 sm:p-0 h-screen flex flex-col lg:flex-row">
      {children}
      <div className="hidden lg:grid w-full h-full lg:w-1/2 items-center bg-brand-950 dark:bg-white/5">
        <div className="relative flex items-center justify-center">
          <GridShape />
          <div className="flex flex-col items-center max-w-xs z-10">
            <Link to="/" className="block mb-4">
              <img
                width={231}
                height={48}
                src="/images/logo/auth-logo.svg"
                alt="Logo"
              />
            </Link>
            <p className="text-center text-gray-400 dark:text-white/60">
              Free and Open-Source Tailwind CSS Admin Dashboard
            </p>
          </div>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
