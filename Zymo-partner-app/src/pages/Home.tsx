import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDocs } from "firebase/firestore";
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
    // ... other fields from the upload form
}

export function Home() {
    const navigate = useNavigate();
    const [cars, setCars] = useState<CarListing[]>([]);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const user = auth.currentUser;
    if (!user) {
        // FIXME: handle this, user is not authed
        return;
    }

    // Fetch car data from Firestore
    const fetchCars = async () => {
        const carsCollection = collection(
            db,
            "partnerWebApp",
            user.uid,
            "uploadedCars"
        );
        const carsSnapshot = await getDocs(carsCollection);
        const carsData = carsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        console.log(carsData); // Check if all data is being fetched correctly
        setCars(carsData as CarListing[]); // Update state with fetched data
    };

    useEffect(() => {
        // Check if user is logged in and get email
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email);
            } else {
                setUserEmail(null);
            }
        });

        // Fetch car data after checking authentication
        fetchCars();

        return () => unsubscribe(); // Cleanup subscription
    }, []);

    const handleEditCar = (carId: string) => {
        navigate(`/edit-car/${carId}`); // Redirect to edit page for the car
    };

    const handleUploadCar = () => {
        navigate("/upload-car", { state: { uid: user.uid } });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkgray">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Greeting Section */}
                <div className="text-center mb-6">
                    {userEmail ? (
                        <h1 className="text-2xl font-semibold text-lightgray dark:text-gray-100">
                            Welcome, {userEmail}!
                        </h1>
                    ) : (
                        <h1 className="text-2xl font-semibold text-lightgray dark:text-gray-100">
                            Welcome!
                        </h1>
                    )}
                </div>

                {/* Car Listings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {cars.map((car) => (
                        <div
                            key={car.id}
                            className="bg-white dark:bg-lightgray rounded-lg shadow-lg overflow-hidden hover:shadow-custom-even hover:shadow-lime transition duration-300 ease-in-out hover:scale-105"
                        >
                            {/* Ensure the imageUrl is correctly accessed */}
                            <img
                                src={car.images[0] || "default_image_url"} // Display first image
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
                                {/* <p className="text-lightgray dark:text-gray-100 mt-2">
        Price: ${car.price}
      </p> */}
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
            </main>
        </div>
    );
}
