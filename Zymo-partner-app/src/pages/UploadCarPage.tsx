import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
//import { useDispatch } from 'react-redux';
import { useDropzone } from "react-dropzone";
import { Car as CarIcon, Upload, X } from "lucide-react";

import { Button } from "../components/Button";
import { Input } from "../components/Input";
//import { AppDispatch } from '../store/store';
import { collection, addDoc, updateDoc } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase"; // Import Firebase Firestore instance
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PickupForm from "../components/PickupForm";
import "react-day-picker/dist/style.css";
const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid"];
const CAR_TYPES = ["Sedan", "SUV", "Hatchback", "MPV", "Luxury"];
const TRANSMISSION_TYPES = ["Manual", "Automatic"];

export function UploadCarPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { uid } = location.state || {};
  // const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const carId = searchParams.get("carId"); // Extract carId from URL
  const mode = searchParams.get("mode"); // Extract mode from URL
  const isEditMode = mode === "edit"; // Check if in edit mode
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [usercities, setUserCities] = useState([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    cities: [] as string[],
    pickupLocation: "",
    securityDeposit: "",
    yearOfRegistration: new Date().getFullYear(),
    fuelType: FUEL_TYPES[0],
    carType: CAR_TYPES[0],
    transmissionType: TRANSMISSION_TYPES[0],
    minBookingDuration: 1,
    unit: "hours",
    noOfSeats: 4, // Default value for number of seats
    hourlyRental: {
      limit: "Limit Type" as "Limit Type" | "Limited" | "Unlimited", // Limit type
      limited: {
        packages: [{ hourlyRate: "", kmPerHour: "" }], // Default package
        extraKmRate: "",
        extraHourRate: "",
      },
      unlimited: {
        fixedHourlyRate: "",
        extraKmRate: "",
        extraHourRate: "",
      },
    },
    unavailableDates: [] as string[],
    // In the formData state initialization
    monthlyRental: {
      available: false,
      rate: "",
      limit: "Limit type" as "Limit Type" | "Unlimited" | "Limited",
      limitValueKm: "",
      limitValueHr: "",
      packages: [] as Array<{
        rate: string;
        kmLimit: string;
        extraHourRate: string; // Added
        extraKmRate: string; // Added
      }>,
    },
    weeklyRental: {
      available: false,
      rate: "",
      limit: "Limit Type" as "Limit Type" | "Unlimited" | "Limited",
      limitValueKm: "",
      limitValueHr: "",
      packages: [] as Array<{
        rate: string;
        kmLimit: string;
        extraHourRate: string;
        extraKmRate: string;
      }>,
    },
    deliveryCharges: {
      enabled: false,
      Range: "",
      charges: {
        "0-10": "",
        "10-25": "",
        "25-50": "",
      },
    },
  });

  useEffect(() => {
    const fetchCarData = async () => {
      if (!isEditMode || !carId) return;

      try {
        const user = auth.currentUser;
        if (!user) {
          setError("User not authenticated.");
          return;
        }

        const carDocRef = doc(
          db,
          "partnerWebApp",
          user.uid,
          "uploadedCars",
          carId
        );
        const carDoc = await getDoc(carDocRef);

        if (carDoc.exists()) {
          const carData = carDoc.data();
          setFormData(carData as typeof formData);

          // Set image previews if images exist
          if (carData.images && carData.images.length > 0) {
            setImagePreviews(carData.images);
          }
        } else {
          setError("Car not found.");
        }
      } catch (err) {
        console.error("Error fetching car data:", err);
        setError("Failed to fetch car data.");
      }
    };

    fetchCarData();
  }, [isEditMode, carId]);

  useEffect(() => {
    // Use Firebase's auth state observer instead of just checking currentUser once
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        const userId = uid || user.uid;
        // Do what you need with the userId
        setError(null); // Clear any previous errors
      } else {
        // No user is signed in
        setError("User ID is missing. Please log in again.");
        setIsSubmitting(false);
      }
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array as we want this to run once when component mounts

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.slice(0, 5 - imageFiles.length);
      setImageFiles([...imageFiles, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    },
    maxFiles: 5,
  });

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];

    URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handlePickupLocationChange = (location: string) => {
    setFormData((prevDetails) => ({
      ...prevDetails,
      pickupLocation: location,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0 && !isEditMode) {
      setError("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const user = auth.currentUser;
      const uid = user ? user.uid : null;

      if (!uid) {
        console.error("User is not logged in. Cannot upload car details.");
        setError("Authentication error. Please log in again.");
        setIsSubmitting(false);
        return;
      }
      const storage = getStorage();

      let imageUrls = imagePreviews;

      // Upload new images if any
      if (imageFiles.length > 0) {
        imageUrls = await Promise.all(
          imageFiles.map(async (file) => {
            const storageRef = ref(
              storage,
              `partnerWebAppCarImages/${file.name}`
            );
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
          })
        );
      }

      const carData = {
        ...formData,
        images: imageUrls,
      };

      if (isEditMode && carId) {
        // Update existing car document
        const carDocRef = doc(db, "partnerWebApp", uid, "uploadedCars", carId);
        await updateDoc(carDocRef, carData);
        setSuccessMessage("Changes saved successfully!"); // Set success message
      } else {
        // Add new car document
        const carsRef = collection(db, "partnerWebApp", uid, "uploadedCars");
        await addDoc(carsRef, carData);
        setSuccessMessage("Car uploaded successfully!"); // Set success message
      }

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (err) {
      console.error("Error uploading car details:", err);
      setError("Failed to upload car details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // To control dropdown visibility
  const [searchTerm, setSearchTerm] = useState(""); // To filter cities

  const dropdownRef = useRef<HTMLDivElement>(null); // Reference for dropdown
  const inputRef = useRef<HTMLInputElement>(null); // Reference for input

  const handleSelectChange = (city: string) => {
    const newCities = formData.cities.includes(city)
      ? formData.cities.filter((c) => c !== city)
      : [...formData.cities, city];
    setFormData({ ...formData, cities: newCities });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCities = usercities.filter((city: string) =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown if the user clicks outside of it
  useEffect(() => {
    const fetchUserCities = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userDocRef = doc(db, "partnerWebApp", user.uid); // Reference to user's Firestore doc
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserCities(userDoc.data().cities || []);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    fetchUserCities();
    setTimeout(() => {
      setShowForm(true);
    }, 200); // Delay of 200ms before showing the form

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-lime rounded-2xl dark:bg-transparent">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div
          className={`dark:bg-darkgray bg-white rounded-3xl shadow-lg p-6 border border-lime transition-all duration-1000 ease-in-out
            ${
              showForm
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-20"
            }`}
        >
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-lime/40 dark:bg-lime p-3 rounded-full">
              <CarIcon className="h-6 w-6 text-darklime/90" />
            </div>
            <h1 className="text-3xl font-bold text-darklime dark:text-lime">
              {isEditMode ? "Edit Car Details" : "Upload Car Details"}
            </h1>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Car Name"
                required
                value={formData.name}
                onChange={(e: { target: { value: any } }) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
              />

              {/* Image Upload */}
              <div className="py-2">
                <label className="block text-sm text-gray-700 mx-1 font-medium dark:text-white mb-3">
                  Car Images (Max 5)
                </label>
                <div
                  {...getRootProps()}
                  className={`
                  border-2 border-gray-300 border-dashed rounded-2xl p-6 text-center cursor-pointer
                  ${
                    imageFiles.length >= 5
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-darklime dark:hover:border-lime"
                  }
                `}
                >
                  <input
                    {...getInputProps()}
                    disabled={imageFiles.length >= 5}
                  />
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm dark:text-gray-300">
                    Drag and drop images here, or click to select files
                  </p>
                  <p className="text-xs dark:text-gray-300 mt-1">
                    Supports: JPG, PNG, GIF (Max size: 5MB each)
                  </p>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={preview} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cities */}
              <div className="">
                <label className="block text-sm px-1 font-medium text-gray-700 dark:text-white mb-3">
                  Cities Available
                </label>

                {/* Input Box with Dropdown */}
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={formData.cities.join(", ")} // Display selected cities as a comma-separated string
                    readOnly
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown on click
                    className="mt-1 dark:text-white pl-3 block w-full border border-gray-500 rounded-2xl p-2 dark:bg-lightgray dark:border-gray-700 shadow-sm focus:ring-lime focus:border-lime"
                    placeholder="Select cities..."
                  />

                  {/* Dropdown */}
                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute left-0 w-full mt-1 bg-white 00 border border-lime rounded-2xl shadow-lg max-h-60 overflow-y-auto dark:bg-lightgray z-10"
                    >
                      <input
                        type="text"
                        placeholder="Search cities..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full p-2 border-b border-b-lime border-gray-300 dark:bg-lightgray dark:text-white focus:ring-lime "
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {filteredCities.map((city) => (
                          <div
                            key={city}
                            className="flex items-center space-x-2 p-2 hover:bg-lime/30  cursor-pointer"
                            onClick={() => handleSelectChange(city)} // Toggle checkbox when clicking the city
                          >
                            <span className="text-sm dark:text-gray-300 ">
                              {city}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Display Selected Cities Below the Input */}
                <div className="mt-4">
                  {formData.cities.map((city) => (
                    <span
                      key={city}
                      className="inline-flex items-center px-2 py-1 text-xs bg-lime rounded-full mr-2 mb-2"
                    >
                      {city}
                      <button
                        type="button"
                        onClick={() => handleSelectChange(city)} // Deselect the city
                        className="ml-1 text-sm text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <PickupForm onLocationChange={handlePickupLocationChange} />
                <p className="ml-1 dark:text-white">
                  Selected Pickup Location: {formData.pickupLocation}
                </p>
              </div>
              <Input
                label="Security Deposit"
                type="text"
                prefix="₹"
                required
                value={formData.securityDeposit}
                onChange={(e: { target: { value: any } }) =>
                  setFormData({
                    ...formData,
                    securityDeposit: e.target.value,
                  })
                }
              />

              {/* Car Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mx-1 block text-sm font-medium text-gray-700 dark:text-white mb-3">
                    Year of Registration
                  </label>
                  <select
                    value={formData.yearOfRegistration}
                    style={{
                      colorScheme: "",
                    }}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yearOfRegistration: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-2xl border border-lightgray p-2 dark:bg-lightgray dark:text-white  shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                  >
                    {Array.from(
                      { length: 20 },
                      (_, i) => new Date().getFullYear() - i
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mx-1 block text-sm dark:text-white font-medium text-gray-700 mb-3">
                    Fuel Type
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fuelType: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-2xl p-2 dark:text-white dark:bg-lightgray border border-lightgray shadow-sm "
                  >
                    {FUEL_TYPES.map((type) => (
                      <option key={type} value={type} className="rounded-2xl">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mx-1 dark:text-white text-sm font-medium text-gray-700 mb-3">
                    Car Type
                  </label>
                  <select
                    value={formData.carType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        carType: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-lightgray rounded-2xl p-2 dark:bg-lightgray dark:text-white  shadow-sm focus:border-lime focus:ring-lime"
                  >
                    {CAR_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mx-1 text-sm font-medium text-gray-700 mb-3 dark:text-white">
                    Transmission Type
                  </label>
                  <select
                    value={formData.transmissionType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transmissionType: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-lightgray rounded-2xl p-2 dark:bg-lightgray dark:text-white shadow-sm "
                  >
                    {TRANSMISSION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Minimum Booking Duration (hrs / days)"
                  type="text"
                  min="1"
                  required
                  value={formData.minBookingDuration}
                  onChange={(e: { target: { value: any } }) =>
                    setFormData({
                      ...formData,
                      minBookingDuration: e.target.value,
                    })
                  }
                />
              </div>
              {/* Unit Selection */}
              <div className="flex flex-col">
                <div className="flex space-x-4 ml-1">
                  <label className="flex items-center dark:text-white">
                    <input
                      type="radio"
                      name="unit"
                      value="hours"
                      checked={formData.unit === "hours"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unit: e.target.value,
                        })
                      }
                      className="mr-2"
                    />
                    Hours
                  </label>

                  <label className="flex items-center dark:text-white">
                    <input
                      type="radio"
                      name="unit"
                      value="days"
                      checked={formData.unit === "days"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unit: e.target.value,
                        })
                      }
                      className="mr-2"
                    />
                    Days
                  </label>
                </div>
                <p className=" m-1 text-gray-600 dark:text-gray-300 mt-2">
                  Selected Duration: {formData.minBookingDuration}{" "}
                  {formData.unit}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Number of Seats */}
                  <div>
                    <label className="block mx-1 text-sm font-medium text-gray-700 mb-3 dark:text-white">
                      Number of Seats
                    </label>
                    <select
                      value={formData.noOfSeats}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          noOfSeats: Number(e.target.value),
                        })
                      }
                      className="mt-1 block w-full border border-lightgray rounded-2xl p-2 dark:bg-lightgray dark:text-white shadow-sm focus:border-lime focus:ring-lime"
                    >
                      {[3, 4, 5, 6, 7, 8, 9].map((seats) => (
                        <option key={seats} value={seats}>
                          {seats}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Fixed Hourly Rate Section */}
                <div className="space-y-4 mt-10">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium dark:text-white text-gray-700">
                      Hourly Rate (₹/hr){" "}
                      <b className="text-red-500">
                        (including GST & Zymo Commission)
                      </b>
                    </label>
                  </div>
                </div>
                {/* Limit Type Section */}
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Limit Type Dropdown */}
                    <div>
                      <label className="mx-1 block text-sm font-medium dark:text-white text-gray-700 mb-4">
                        Limit Type
                      </label>
                      <select
                        value={formData.hourlyRental.limit}
                        onChange={(e) => {
                          const newLimit = e.target.value as
                            | "Limit Type"
                            | "Limited"
                            | "Unlimited";
                          const updatedFormData = {
                            ...formData,
                            hourlyRental: {
                              ...formData.hourlyRental,
                              limit: newLimit,
                              limited: {
                                ...formData.hourlyRental.limited,
                                packages:
                                  newLimit === "Limited"
                                    ? [{ hourlyRate: "", kmPerHour: "" }]
                                    : [], // Initialize with default package
                              },
                            },
                          };
                          setFormData(updatedFormData);
                        }}
                        className="mt-1 block p-2 border border-gray-700 dark:bg-lightgray dark:text-white w-full rounded-2xl shadow-sm"
                      >
                        <option value="Limit Type">Limit Type</option>
                        <option value="Limited">Limited</option>
                        <option value="Unlimited">Unlimited</option>
                      </select>
                    </div>
                  </div>

                  {/* Packages Section (Only for Limited) */}
                  {formData.hourlyRental.limit === "Limited" && (
                    <>
                      {/* Packages Section */}

                      {formData.hourlyRental.limited.packages.map(
                        (pkg, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
                          >
                            {/* Hourly Rate Input */}
                            <Input
                              label={`Package ${
                                index + 1
                              } - Hourly Rate (₹/hr)`}
                              type="text"
                              min="0"
                              prefix="₹"
                              required
                              value={pkg.hourlyRate}
                              onChange={(e: { target: { value: any } }) => {
                                const updatedPackages = [
                                  ...formData.hourlyRental.limited.packages,
                                ];
                                updatedPackages[index].hourlyRate =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  hourlyRental: {
                                    ...formData.hourlyRental,
                                    limited: {
                                      ...formData.hourlyRental.limited,
                                      packages: updatedPackages,
                                    },
                                  },
                                });
                              }}
                            />

                            {/* Km per Hour Input */}
                            <Input
                              label={`Package ${
                                index + 1
                              } - Km per Hour (km/hr)`}
                              type="text"
                              min="0"
                              required
                              value={pkg.kmPerHour}
                              onChange={(e: { target: { value: any } }) => {
                                const updatedPackages = [
                                  ...formData.hourlyRental.limited.packages,
                                ];
                                updatedPackages[index].kmPerHour =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  hourlyRental: {
                                    ...formData.hourlyRental,
                                    limited: {
                                      ...formData.hourlyRental.limited,
                                      packages: updatedPackages,
                                    },
                                  },
                                });
                              }}
                            />

                            {/* Remove Package Button */}
                            {index > 0 && ( // Only show remove button for non-default packages
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedPackages =
                                      formData.hourlyRental.limited.packages.filter(
                                        (_, i) => i !== index
                                      );
                                    setFormData({
                                      ...formData,
                                      hourlyRental: {
                                        ...formData.hourlyRental,
                                        limited: {
                                          ...formData.hourlyRental.limited,
                                          packages: updatedPackages,
                                        },
                                      },
                                    });
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕ Remove
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      )}

                      {/* Add Package Button (Rendered only once) */}
                      {formData.hourlyRental.limited.packages.length < 5 && (
                        <div className="flex items-end mt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                hourlyRental: {
                                  ...formData.hourlyRental,
                                  limited: {
                                    ...formData.hourlyRental.limited,
                                    packages: [
                                      ...formData.hourlyRental.limited.packages,
                                      { hourlyRate: "", kmPerHour: "" }, // Add a new package
                                    ],
                                  },
                                },
                              });
                            }}
                            className="bg-lime px-4 py-2 rounded-2xl hover:bg-lime/80"
                          >
                            Add Package
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Extra Rates Section */}
                  {formData.hourlyRental.limit === "Limited" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Input
                        label="Extra Hour Rate (₹/hr)"
                        type="text"
                        min="0"
                        prefix="₹"
                        required
                        value={formData.hourlyRental.limited.extraHourRate}
                        onChange={(e: { target: { value: any } }) =>
                          setFormData({
                            ...formData,
                            hourlyRental: {
                              ...formData.hourlyRental,
                              limited: {
                                ...formData.hourlyRental.limited,
                                extraHourRate: e.target.value,
                              },
                            },
                          })
                        }
                      />
                      <Input
                        label="Extra Km Rate (₹/km)"
                        type="text"
                        min="0"
                        prefix="₹"
                        required
                        value={formData.hourlyRental.limited.extraKmRate}
                        onChange={(e: { target: { value: any } }) =>
                          setFormData({
                            ...formData,
                            hourlyRental: {
                              ...formData.hourlyRental,
                              limited: {
                                ...formData.hourlyRental.limited,
                                extraKmRate: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  )}
                  {formData.hourlyRental.limit === "Unlimited" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="max-w-md">
                        <Input
                          label="Fixed Hourly Rate ( ₹/hr )"
                          type="text"
                          required
                          prefix="₹"
                          value={
                            formData.hourlyRental.unlimited.fixedHourlyRate
                          }
                          onChange={(e: { target: { value: any } }) =>
                            setFormData({
                              ...formData,
                              hourlyRental: {
                                ...formData.hourlyRental,
                                unlimited: {
                                  ...formData.hourlyRental.unlimited,
                                  fixedHourlyRate: e.target.value,
                                },
                              },
                            })
                          }
                        />
                      </div>
                      <Input
                        label="Extra Hour Rate (₹/hr)"
                        type="text"
                        min="0"
                        prefix="₹"
                        required
                        value={formData.hourlyRental.unlimited.extraHourRate}
                        onChange={(e: { target: { value: any } }) =>
                          setFormData({
                            ...formData,
                            hourlyRental: {
                              ...formData.hourlyRental,
                              unlimited: {
                                ...formData.hourlyRental.unlimited,
                                extraHourRate: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Rental */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.monthlyRental.available}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyRental: {
                          ...formData.monthlyRental,
                          available: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-500"
                  />
                  <label className="text-sm font-medium dark:text-white text-gray-700">
                    Monthly Rental Prices ( 30 Days ){" "}
                    <b className=" text-red-500">
                      {" "}
                      (including GST & Zymo Commission)
                    </b>
                  </label>
                </div>

                {formData.monthlyRental.available && (
                  <div className="grid   gap-4 pl-6">
                    <Input
                      label="Monthly Rate"
                      type="text"
                      prefix="₹"
                      min="0"
                      required
                      value={formData.monthlyRental.rate}
                      onChange={(e: { target: { value: any } }) =>
                        setFormData({
                          ...formData,
                          monthlyRental: {
                            ...formData.monthlyRental,
                            rate: e.target.value,
                          },
                        })
                      }
                    />

                    <div>
                      <label className="mx-1 block text-sm font-medium dark:text-white text-gray-700 mb-4">
                        Limit Type
                      </label>
                      <select
                        value={formData.monthlyRental.limit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyRental: {
                              ...formData.monthlyRental,
                              limit: e.target.value as
                                | "Limit Type"
                                | "Unlimited"
                                | "Limited",
                            },
                          })
                        }
                        className="mt-1 block p-2 border border-gray-700 dark:bg-lightgray dark:text-white w-full rounded-2xl shadow-sm "
                      >
                        <option value="Type">Limit Type</option>
                        <option value="Unlimited">Unlimited</option>
                        <option value="Limited">Limited</option>
                      </select>
                    </div>

                    {formData.monthlyRental.limit === "Limited" && (
                      <>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (formData.monthlyRental.packages.length < 5) {
                                setFormData({
                                  ...formData,
                                  monthlyRental: {
                                    ...formData.monthlyRental,
                                    packages: [
                                      ...formData.monthlyRental.packages,
                                      {
                                        rate: "",
                                        kmLimit: "",
                                        extraHourRate: "", // Initialize
                                        extraKmRate: "", // Initialize
                                      },
                                    ],
                                  },
                                });
                              }
                            }}
                            className="bg-lime px-4 py-2 rounded-2xl hover:bg-lime/80"
                          >
                            Add Package
                          </button>
                        </div>

                        {formData.monthlyRental.packages.map((pkg, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
                          >
                            <Input
                              label={`Package ${index + 1} - Monthly Rate`}
                              type="text"
                              prefix="₹"
                              required
                              value={pkg.rate}
                              onChange={(e: { target: { value: string } }) => {
                                const updatedPackages = [
                                  ...formData.monthlyRental.packages,
                                ];
                                updatedPackages[index].rate = e.target.value;
                                setFormData({
                                  ...formData,
                                  monthlyRental: {
                                    ...formData.monthlyRental,
                                    packages: updatedPackages,
                                  },
                                });
                              }}
                            />
                            <Input
                              label={`Package ${index + 1} - KM Limit`}
                              type="text"
                              required
                              value={pkg.kmLimit}
                              onChange={(e: { target: { value: any } }) => {
                                const updatedPackages = [
                                  ...formData.monthlyRental.packages,
                                ];
                                updatedPackages[index].kmLimit = e.target.value;
                                setFormData({
                                  ...formData,
                                  monthlyRental: {
                                    ...formData.monthlyRental,
                                    packages: updatedPackages,
                                  },
                                });
                              }}
                            />
                            <Input
                              label={`Package ${index + 1} - Extra Hour Rate`}
                              type="text"
                              prefix="₹"
                              required
                              value={pkg.extraHourRate}
                              onChange={(e: { target: { value: string } }) => {
                                const updatedPackages = [
                                  ...formData.monthlyRental.packages,
                                ];
                                updatedPackages[index].extraHourRate =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  monthlyRental: {
                                    ...formData.monthlyRental,
                                    packages: updatedPackages,
                                  },
                                });
                              }}
                            />
                            <Input
                              label={`Package ${index + 1} - Extra KM Rate`}
                              type="text"
                              prefix="₹"
                              required
                              value={pkg.extraKmRate}
                              onChange={(e: { target: { value: string } }) => {
                                const updatedPackages = [
                                  ...formData.monthlyRental.packages,
                                ];
                                updatedPackages[index].extraKmRate =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  monthlyRental: {
                                    ...formData.monthlyRental,
                                    packages: updatedPackages,
                                  },
                                });
                              }}
                            />
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedPackages =
                                    formData.monthlyRental.packages.filter(
                                      (_, i) => i !== index
                                    );
                                  setFormData({
                                    ...formData,
                                    monthlyRental: {
                                      ...formData.monthlyRental,
                                      packages: updatedPackages,
                                    },
                                  });
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕ Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {formData.monthlyRental.limit === "Unlimited" && (
                      <Input
                        label="Extra Hr rate"
                        type="text"
                        min="0"
                        prefix="₹"
                        required
                        value={formData.monthlyRental.limitValueHr}
                        onChange={(e: { target: { value: any } }) =>
                          setFormData({
                            ...formData,
                            monthlyRental: {
                              ...formData.monthlyRental,
                              limitValueHr: e.target.value,
                            },
                          })
                        }
                      />
                    )}
                  </div>
                )}
              </div>
              {/* Weekly Rental */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.weeklyRental.available}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weeklyRental: {
                          ...formData.weeklyRental,
                          available: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-500"
                  />
                  <label className="text-sm font-medium dark:text-white text-gray-700">
                    Weekly Rental Prices ( 7 days ){" "}
                    <b className=" text-red-500">
                      {" "}
                      (including GST & Zymo Commission)
                    </b>
                  </label>
                </div>

                {formData.weeklyRental.available && (
                  <div className="grid   gap-4 pl-6">
                    <Input
                      label="Weekly Rental Prices"
                      type="text"
                      min="0"
                      prefix="₹"
                      required
                      value={formData.weeklyRental.rate}
                      onChange={(e: { target: { value: any } }) =>
                        setFormData({
                          ...formData,
                          weeklyRental: {
                            ...formData.weeklyRental,
                            rate: e.target.value,
                          },
                        })
                      }
                    />

                    <div>
                      <label className="mx-1 block text-sm font-medium dark:text-white text-gray-700 mb-4">
                        Limit Type
                      </label>
                      <select
                        value={formData.weeklyRental.limit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            weeklyRental: {
                              ...formData.weeklyRental,
                              limit: e.target.value as
                                | "Limit Type"
                                | "Unlimited"
                                | "Limited",
                            },
                          })
                        }
                        className="mt-1 block p-2 border border-gray-700 dark:bg-lightgray dark:text-white w-full rounded-2xl shadow-sm "
                      >
                        <option value="Type">Limit Type</option>
                        <option value="Unlimited">Unlimited</option>
                        <option value="Limited">Limited</option>
                      </select>
                    </div>

                    {formData.weeklyRental.limit === "Limited" && (
                      <>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (formData.weeklyRental.packages.length < 5) {
                                setFormData({
                                  ...formData,
                                  weeklyRental: {
                                    ...formData.weeklyRental,
                                    packages: [
                                      ...formData.weeklyRental.packages,
                                      {
                                        rate: "",
                                        kmLimit: "",
                                        extraHourRate: "",
                                        extraKmRate: "",
                                      },
                                    ],
                                  },
                                });
                              }
                            }}
                            className="bg-lime px-4 py-2 rounded-2xl hover:bg-lime/80"
                          >
                            Add Package
                          </button>
                        </div>

                        {formData.weeklyRental.packages.map((pkg, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
                          >
                            <Input
                              label={`Package ${index + 1} - Weekly Rate`}
                              type="text"
                              prefix="₹"
                              required
                              value={pkg.rate}
                              onChange={(e: { target: { value: string } }) => {
                                const updatedPackages = [
                                  ...formData.weeklyRental.packages,
                                ];
                                updatedPackages[index].rate = e.target.value;
                                setFormData({
                                  ...formData,
                                  weeklyRental: {
                                    ...formData.weeklyRental,
                                    packages: updatedPackages,
                                  },
                                });
                              }}
                            />
                            <Input
                              label={`Package ${index + 1} - KM Limit`}
                              type="text"
                              required
                              value={pkg.kmLimit}
                              onChange={(e: { target: { value: any } }) => {
                                const updatedPackages = [
                                  ...formData.weeklyRental.packages,
                                ];
                                updatedPackages[index].kmLimit = e.target.value;
                                setFormData({
                                  ...formData,
                                  weeklyRental: {
                                    ...formData.weeklyRental,
                                    packages: updatedPackages,
                                  },
                                });
                              }}
                            />
                            // Fix weekly package input handlers
                            <Input
                              label={`Package ${index + 1} - Extra Hour Rate`}
                              type="text"
                              prefix="₹"
                              required
                              value={pkg.extraHourRate}
                              onChange={(e: { target: { value: string } }) => {
                                const updatedPackages = [
                                  ...formData.weeklyRental.packages,
                                ]; // Changed to weeklyRental
                                updatedPackages[index].extraHourRate =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  weeklyRental: {
                                    ...formData.weeklyRental,
                                    packages: updatedPackages,
                                  },
                                });
                              }}
                            />
                            <Input
                              label={`Package ${index + 1} - Extra KM Rate`}
                              type="text"
                              prefix="₹"
                              required
                              value={pkg.extraKmRate}
                              onChange={(e: { target: { value: string } }) => {
                                const updatedPackages = [
                                  ...formData.weeklyRental.packages,
                                ]; // Changed to weeklyRental
                                updatedPackages[index].extraKmRate =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  weeklyRental: {
                                    ...formData.weeklyRental,
                                    packages: updatedPackages,
                                  },
                                });
                              }}
                            />
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedPackages =
                                    formData.weeklyRental.packages.filter(
                                      (_, i) => i !== index
                                    );
                                  setFormData({
                                    ...formData,
                                    weeklyRental: {
                                      ...formData.weeklyRental,
                                      packages: updatedPackages,
                                    },
                                  });
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕ Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {formData.weeklyRental.limit === "Unlimited" && (
                      <Input
                        label="Extra Hr Rate"
                        type="text"
                        min="0"
                        prefix="₹"
                        required
                        value={formData.weeklyRental.limitValueHr}
                        onChange={(e: { target: { value: string } }) => {
                          setFormData({
                            ...formData,
                            weeklyRental: {
                              ...formData.weeklyRental,
                              limitValueHr: e.target.value,
                            },
                          });
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Charges */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.deliveryCharges.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryCharges: {
                          ...formData.deliveryCharges,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300 "
                  />
                  <label className="text-sm font-medium dark:text-white text-gray-700">
                    Home Delivery/Pickup Prices{" "}
                    <b className=" text-red-500">
                      {" "}
                      (including GST & Zymo Commission)
                    </b>
                  </label>
                </div>

                {formData.deliveryCharges.enabled && (
                  <div>
                    <div className="m-2 dark:text-gray-400">
                      Specify the home delivery charges for different distance
                      ranges.
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                      <Input
                        label="0-10 km"
                        type="text"
                        min=""
                        prefix="₹"
                        required
                        value={formData.deliveryCharges.charges["0-10"]}
                        onChange={(e: { target: { value: any } }) =>
                          setFormData({
                            ...formData,
                            deliveryCharges: {
                              ...formData.deliveryCharges,
                              charges: {
                                ...formData.deliveryCharges.charges,
                                "0-10": e.target.value,
                              },
                            },
                          })
                        }
                      />

                      <Input
                        label="10-25 km"
                        type="text"
                        min="0"
                        required
                        prefix="₹"
                        value={formData.deliveryCharges.charges["10-25"]}
                        onChange={(e: { target: { value: any } }) =>
                          setFormData({
                            ...formData,
                            deliveryCharges: {
                              ...formData.deliveryCharges,
                              charges: {
                                ...formData.deliveryCharges.charges,
                                "10-25": e.target.value,
                              },
                            },
                          })
                        }
                      />

                      <Input
                        label="25-50 km"
                        type="text"
                        min="0"
                        prefix="₹"
                        required
                        value={formData.deliveryCharges.charges["25-50"]}
                        onChange={(e: { target: { value: any } }) =>
                          setFormData({
                            ...formData,
                            deliveryCharges: {
                              ...formData.deliveryCharges,
                              charges: {
                                ...formData.deliveryCharges.charges,
                                "25-50": e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div></div>
            <div className="flex justify-center space-x-4">
              <Button
                type="button"
                variant="secondary"
                className="hover:bg-gray-300 w-full"
                onClick={() => navigate("/home")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full bg-lime text-black dark:text-black hover:bg-lime/70"
                isLoading={isSubmitting}
              >
                {isEditMode ? "Save Changes" : "Upload Car"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
