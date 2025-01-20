import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Car, Plus, AlignJustify } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { Button } from '../components/Button';
import { Dashboard } from '../components/Dashboard';
import { DarkModeToggle } from '../components/DarkModeToggle';

interface CarListing {
  id: string;
  name: string;
  city: string;
  price: number;
  imageUrl: string;
}

export function Home() {
  const navigate = useNavigate();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const q = query(
          collection(db, 'cars'),
          where('userId', '==', auth.currentUser?.uid)
        );

        const querySnapshot = await getDocs(q);
        const carsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CarListing[];

        setCars(carsList);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Overlay */}
      {isDashboardOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={() => setIsDashboardOpen(false)}
        />
      )}

      {/* Dashboard */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800  transform transition-transform duration-300 ease-in-out z-50 ${
          isDashboardOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Dashboard
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 "
                  aria-label="Open sidebar"
                >
                  <AlignJustify className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </button>
                <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                  Home Screen
                </h1>
              </div>
              <DarkModeToggle />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </div>
          ) : cars.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <Car className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Upload car details
              </p>
              <Button
                onClick={() => navigate('/upload-car')}
                className="inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Upload Car
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <div
                  key={car.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <img
                    src={car.imageUrl}
                    alt={car.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {car.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {car.city}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-lg font-bold text-yellow-600 dark:text-yellow-500">
                        ${car.price}/day
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/cars/${car.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Car Button */}
          {cars.length != 0 ? (
            <div className="fixed bottom-8 right-8">
              <Button
                onClick={() => navigate('/upload-car')}
                className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
