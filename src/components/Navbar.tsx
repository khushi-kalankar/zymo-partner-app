import { AlignJustify } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';
import { useNavigate } from 'react-router-dom';  

interface NavbarProps {
  isDashboardOpen: boolean;
  setIsDashboardOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Navbar({ isDashboardOpen, setIsDashboardOpen }: NavbarProps) {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/home');
  };
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsDashboardOpen(!isDashboardOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Open sidebar"
            >
              <AlignJustify className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={handleNavigation}
              className="ml-2 text-xl font-semibold text-gray-900 dark:text-white bg-transparent p-2 "
            >
              Home Screen
            </button>
          </div>
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
