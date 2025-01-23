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
        imageUrl: 'https://shorturl.at/9XtaS',
      },
      {
        id: '2',
        name: 'BMW X5',
        city: 'Los Angeles',
        price: 64999,
        imageUrl: 'https://shorturl.at/9XtaS',
      },
      {
        id: '3',
        name: 'Audi Q7',
        city: 'Chicago',
        price: 55999,
        imageUrl: 'https://shorturl.at/9XtaS',
      },
      {
        id: '4',
        name: 'Mercedes-Benz GLC',
        city: 'San Francisco',
        price: 49999,
        imageUrl: 'https://shorturl.at/9XtaS',
      },
      {
        id: '5',
        name: 'Ford Mustang',
        city: 'Miami',
        price: 42999,
        imageUrl: 'https://shorturl.at/9XtaS',
      },
    ];
    
    // Simulate fetching data with a delay (optional)
    setTimeout(() => {
      setCars(dummyCars);
      setIsLoading(false);
    }, 900); // 
    
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime"></div>
            </div>
          ) : cars.length === 0 ? (
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center`}>
              <Car className="h-12 w-12 dark:text-lime text-darklime mx-auto mb-2" />
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
          <div className= {`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10`}>
              {cars.map((car) => (
                <div
                  key={car.id}
                  className="border border-lime transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-100 duration-200 bg-white dark:bg-gray-800 rounded-2xl hover:shadow-[0_0_25px_#D3F1A7] overflow-hidden"
                >
                  <img
                    src={car.imageUrl}
                    alt={car.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 bg-lime">
                    <h3 className="text-lg font-medium text-gray-900">
                      {car.name}
                    </h3>
                    <p className="text-gray-600">
                      {car.city}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-2xl font-bold dark:text-gray-800">
                        ${car.price}/day
                      </span>
                      <Button
                        variant="secondary"
                        className='sm:ml-3 rounded-full hover:shadow-xl bg-white dark:bg-gray-800 dark:text-white'
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
                className="rounded-full hover:bg-[#9bbf65] bg-lime w-14 h-14 flex items-center justify-center shadow-lg"
              >
                <Plus className=" text-black h-6 w-6" />
              </Button>
            </div>
          ) : null}
        </main>

    </div>
  );
}
