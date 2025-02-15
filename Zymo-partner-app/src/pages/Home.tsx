import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Button } from "../components/Button";
import { Plus } from "lucide-react";

interface CarListing {
  id: string;
  name: string;
  cities: string[];
  images: string[];
  securityDeposit: number;
  yearOfRegistration: number;
  fuelType: string;
  carType: string;
  transmissionType: string;
  minBookingDuration: number;
  kmRate: number;
  extraHourRate: number;
}

export function Home() {
  const navigate = useNavigate();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            setUserProfile(null);
          }

          // Fetch cars only after the user is confirmed
          const carsCollection = collection(db, "partnerWebApp", user.uid, "uploadedCars");
          const carsSnapshot = await getDocs(carsCollection);
          const carsData = carsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCars(carsData as CarListing[]);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        setUserEmail(null);
        setUserProfile(null);
        setCars([]); // Clear cars when logged out
      }
      setLoading(false); // Mark loading as done
    });

    return () => unsubscribe();
  }, []);

  const handleEditCar = (carId: string) => {
    navigate(`/edit-car/${carId}`);
  };

  const handleUploadCar = () => {
    navigate("/upload-car");
  };

  return (
    <div className="dark:bg-darkgray">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show loading text until data is ready */}
        {loading ? (
          <div className="text-center text-lightgray dark:text-gray-100 text-xl">
            Loading...
          </div>
        ) : (
          <>
            {/* Greeting Section */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-lightgray dark:text-gray-100">
                {userEmail ? `Welcome, ${userEmail}!` : "Welcome!"}
              </h1>
            </div>

            {/* Car Listings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {cars.map((car) => (
                <div
                  key={car.id}
                  className="bg-white dark:bg-lightgray rounded-lg shadow-lg overflow-hidden hover:shadow-custom-even hover:shadow-lime transition duration-300 ease-in-out hover:scale-105"
                >
                  <img
                    src={car.images[0] || "default_image_url"}
                    alt={car.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-lightgray dark:text-gray-100">
                      {car.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {car.cities.join(", ")}
                    </p>
                    <div className="mt-4">
                      <Button
                        onClick={() => handleEditCar(car.id)}
                        className="bg-lime px-4 py-2 rounded"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Car Button */}
            <div className="fixed bottom-8 right-8">
              <Button
                onClick={handleUploadCar}
                className="rounded-full hover:bg-[#9bbf65] bg-lime w-14 h-14 flex items-center justify-center shadow-lg"
              >
                <Plus className="text-black h-6 w-6" />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
