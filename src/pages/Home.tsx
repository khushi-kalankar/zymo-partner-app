import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Car, Plus, AlignJustify } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { Button } from '../components/Button';

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

  // useEffect(() => {
  //   const fetchCars = async () => {
  //     try {
  //       const q = query(
  //         collection(db, 'cars'),
  //         where('userId', '==', auth.currentUser?.uid)
  //       );

  //       const querySnapshot = await getDocs(q);
  //       const carsList = querySnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       })) as CarListing[];

  //       setCars(carsList);
  //     } catch (error) {
  //       console.error('Error fetching cars:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchCars();
  // }, []);
  useEffect(() => {
    setIsLoading(true);

    // Dummy data for testing
    const dummyCars: CarListing[] = [
      {
        id: '1',
        name: 'Tesla Model S',
        city: 'New York',
        price: 79999,
        imageUrl: 'https://via.placeholder.com/300x200?text=Tesla+Model+S',
      },
      {
        id: '2',
        name: 'BMW X5',
        city: 'Los Angeles',
        price: 64999,
        imageUrl: 'https://via.placeholder.com/300x200?text=BMW+X5',
      },
      {
        id: '3',
        name: 'Audi Q7',
        city: 'Chicago',
        price: 55999,
        imageUrl: 'https://via.placeholder.com/300x200?text=Audi+Q7',
      },
      {
        id: '4',
        name: 'Mercedes-Benz GLC',
        city: 'San Francisco',
        price: 49999,
        imageUrl: 'https://via.placeholder.com/300x200?text=Mercedes+GLC',
      },
      {
        id: '5',
        name: 'Ford Mustang',
        city: 'Miami',
        price: 42999,
        imageUrl: 'https://via.placeholder.com/300x200?text=Ford+Mustang',
      },
    ];

    // Simulate fetching data with a delay (optional)
    setTimeout(() => {
      setCars(dummyCars);
      setIsLoading(false);
    }, 1000); // 1-second delay
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

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
  );
}
