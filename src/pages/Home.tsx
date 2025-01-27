import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Car, Plus, AlignJustify, Handshake, Locate } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { Button } from "../components/Button";
import { div } from "framer-motion/client";

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
        id: "1",
        name: "Hyundai Creta",
        city: "Pune",
        price: 3200,
        imageUrl:
          "https://imgd.aeplcdn.com/664x374/n/cw/ec/106815/creta-exterior-left-rear-three-quarter.jpeg?isig=0&q=80",
      },
      {
        id: "2",
        name: "Grand Vitara",
        city: "Pune",
        price: 4200,
        imageUrl: "https://i.ytimg.com/vi/BdwckCrREWA/maxresdefault.jpg",
      },
      {
        id: "3",
        name: "Tata Punch",
        city: "Mumbai",
        price: 2499,
        imageUrl:
          "https://selfdrives.in/backend/images/car_gallery/1641899036.png",
      },
      {
        id: "4",
        name: "Maruti Suzuki Fronx",
        city: "Bangalore",
        price: 2499,
        imageUrl:
          "https://gogoacarrentals.com/wp-content/uploads/2023/06/Maruti-Suzuki-FRONX-automatic-rent-goa1.jpg",
      },
      {
        id: "5",
        name: "Tata Nexon",
        city: "Mumbai",
        price: 2799,
        imageUrl:
          "https://imgd.aeplcdn.com/664x374/n/cw/ec/141867/nexon-facelift-exterior-left-side-view.jpeg?isig=0&q=80",
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
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center`}
          >
            <Car className="h-12 w-12 dark:text-lime text-darklime mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Upload car details
            </p>
            <Button
              onClick={() => navigate("/upload-car")}
              className="inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Upload Car
            </Button>
          </div>
        ) : (
          <div>
            {/* <div className="flex flex-col justify-center md:text-xl">
              <div className="text-darklime font-semibold dark:text-lime justify-center flex mb-7 gap-5 md:gap-10">
                <div>
                  <div className="flex justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6 text-darklime dark:text-lime"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                      />
                    </svg>
                  </div>
                  <div>100,000+ Satisfied Users</div>
                </div>
                <div>
                  <div className="flex justify-center">
                    <Car/>
                  </div>
                <div>30,000+ Cars</div>
                </div>
                <div>
                  <div className="flex justify-center">
                <Handshake />

                  </div>
                <div>18 Service Providers</div>
                </div>

                <div>
                  <div className="flex justify-center">
                <Locate />

                  </div>
                <div>59 Cities</div>
                </div>
              </div>
            </div> */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10`}
            >
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
                    <p className="text-gray-600">{car.city}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-2xl font-bold dark:text-gray-800">
                        ₹{car.price}/day
                      </span>
                      <Button
                        variant="secondary"
                        className="sm:ml-3 rounded-full hover:shadow-xl bg-white dark:bg-gray-800 dark:text-white"
                        onClick={() => navigate(`/cars/${car.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Car Button */}
        {cars.length != 0 ? (
          <div className="fixed bottom-8 right-8">
            <Button
              onClick={() => navigate("/upload-car")}
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
