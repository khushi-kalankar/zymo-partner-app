import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import { useDispatch } from 'react-redux';
import { useDropzone } from "react-dropzone";
import { Car as CarIcon, Upload, X } from "lucide-react";

import { Button } from "../components/Button";
import { Input } from "../components/Input";
//import { AppDispatch } from '../store/store';
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; // Import Firebase Firestore instance

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid"];
const CAR_TYPES = ["Sedan", "SUV", "Hatchback", "MPV", "Luxury"];
const TRANSMISSION_TYPES = ["Manual", "Automatic"];
const CITIES = [
  "Bangalore",
  "Hyderabad",
  "Mumbai",
  "Delhi-NCR",
  "Chennai",
  "Pune",
  "Mangalore",
  "Dombivili",
  "Palava",
  "Thane",
  "Amritsar",
  "Kolkata",
  "Ahmedabad",
  "Bhubaneswar",
  "Chandigarh",
  "Coimbatore",
  "Jaipur",
  "Kochi",
  "Nashik",
  "Madurai",
];

interface Package {
  type: "Unlimited" | "Limited";
  price: number;
}

export function UploadCarPage() {
  const navigate = useNavigate();
  // const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    cities: [] as string[],
    pickupLocation: "",
    securityDeposit: 0,
    yearOfRegistration: new Date().getFullYear(),
    fuelType: FUEL_TYPES[0],
    carType: CAR_TYPES[0],
    transmissionType: TRANSMISSION_TYPES[0],
    minBookingDuration: 1,
    unit: "hours",
    kmRate: 0,
    extraHourRate: 0,
    packages: [] as Package[],
    monthlyRental: {
      available: false,
      rate: 0,
      limit: "Limit type" as "Limit Type" | "Unlimited" | "Limited",
      limitValue: 0,
    },
    weeklyRental: {
      available: false,
      rate: 0,
      limit: "Limit Type" as "Limit Type" | "Unlimited" | "Limited",
      limitValue: 0,
    },
    deliveryCharges: {
      enabled: false,
      Range: 0 ,
      charges: {
        "0-10": 0,
        "10-25": 0,
        "25-50": 0,
      },
    },
  });

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

  // const addPackage = () => {
  //   setFormData({
  //     ...formData,
  //     packages: [...formData.packages, { type: 'Limited', price: 0 }],
  //   });
  // };

  const removePackage = (index: number) => {
    const newPackages = [...formData.packages];
    newPackages.splice(index, 1);
    setFormData({ ...formData, packages: newPackages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const storage = getStorage();

      // Upload images and get URLs
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const storageRef = ref(storage, `testpcars/${file.name}`);
          await uploadBytes(storageRef, file);
          return await getDownloadURL(storageRef);
        })
      );

      // Save to Firestore
      await addDoc(collection(db, "testpcars"), {
        ...formData,
        images: imageUrls,
      });

      navigate("/home");
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

  const filteredCities = CITIES.filter((city) =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown if the user clicks outside of it
  useEffect(() => {
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
    setTimeout(() => {
      setShowForm(true);
    }, 200); // Delay of 500ms before showing the form

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-lime rounded-2xl dark:bg-transparent">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div
          className={`dark:bg-gray-900 bg-white rounded-3xl shadow-lg p-6 border border-lime transition-all duration-1000 ease-in-out
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
              Upload Car Details
            </h1>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Car Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
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
                    className="mt-1 dark:text-white pl-3 block w-full border border-gray-500 rounded-2xl p-2 dark:bg-gray-800 dark:border-gray-700 shadow-sm focus:ring-lime focus:border-lime"
                    placeholder="Select cities..."
                  />

                  {/* Dropdown */}
                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute left-0 w-full mt-1 bg-white 00 border border-lime rounded-2xl shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 z-10"
                    >
                      <input
                        type="text"
                        placeholder="Search cities..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full p-2 border-b border-b-lime border-gray-300 dark:bg-gray-800 dark:text-white focus:ring-lime "
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

              <Input
                label="Pickup Location"
                required
                value={formData.pickupLocation}
                onChange={(e) =>
                  setFormData({ ...formData, pickupLocation: e.target.value })
                }
              />

              <Input
                label="Security Deposit"
                type="number"
                required
                value={formData.securityDeposit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    securityDeposit: Number(e.target.value),
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
                    className="mt-1 block w-full rounded-2xl border border-gray-800 p-2 dark:bg-gray-800 dark:text-white  shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
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
                      setFormData({ ...formData, fuelType: e.target.value })
                    }
                    className="mt-1 block w-full rounded-2xl p-2 dark:text-white dark:bg-gray-800 border border-gray-800 shadow-sm "
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
                      setFormData({ ...formData, carType: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-800 rounded-2xl p-2 dark:bg-gray-800 dark:text-white  shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
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
                    className="mt-1 block w-full border border-gray-800 rounded-2xl p-2 dark:bg-gray-800 dark:text-white shadow-sm "
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
                  type="number"
                  min="1"
                  required
                  value={formData.minBookingDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minBookingDuration: Number(e.target.value),
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
                  
                </div>

                <p className=" m-1 text-gray-600 dark:text-gray-300 mt-2">
                  Selected Duration: {formData.minBookingDuration}{" "}
                  {formData.unit}
                </p>
              {/* Packages */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Package Details
                  </label>
                </div>

                {formData.packages.map((pkg, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <select
                      value={pkg.type}
                      onChange={(e) => {
                        const newPackages = [...formData.packages];
                        newPackages[index].type = e.target.value as
                          | "Unlimited"
                          | "Limited";
                        setFormData({ ...formData, packages: newPackages });
                      }}
                      className="block w-40 rounded-2xl p-2 dark:bg-gray-800 dark:text-white dark:border-gray-700 shadow-sm border"
                    >
                      <option value="Type">Limit Type</option>
                      <option value="Limited">Limited</option>
                      <option value="Unlimited">Unlimited</option>
                    </select>

                    <Input
                      label=""
                      type="number"
                      min="0"
                      step="0.01"
                      value={pkg.price}
                      onChange={(e) => {
                        const newPackages = [...formData.packages];
                        newPackages[index].price = Number(e.target.value);
                        setFormData({ ...formData, packages: newPackages });
                      }}
                      className="flex-1"
                    />

                    <button
                      type="button"
                      onClick={() => removePackage(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
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
                    Monthly Rental Prices ( 30 Days )
                  </label>
                </div>

                {formData.monthlyRental.available && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                    <Input
                      label="Monthly Rate"
                      type="number"
                      min="0"
                      required
                      value={formData.monthlyRental.rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthlyRental: {
                            ...formData.monthlyRental,
                            rate: Number(e.target.value),
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
                              limit: e.target.value as "Limit Type" | "Unlimited" | "Limited",
                            },
                          })
                        }
                        className="mt-1 block p-2 border border-gray-700 dark:bg-gray-800 dark:text-white w-full rounded-2xl shadow-sm "
                      >
                        <option value="Type">Limit Type</option>
                        <option value="Unlimited">Unlimited</option>
                        <option value="Limited">Limited</option>
                      </select>
                    </div>

                    {formData.monthlyRental.limit === "Limited" && (
                      <Input
                        label="Limit Value (KM)"
                        type="number"
                        min="0"
                        required
                        value={formData.monthlyRental.limitValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyRental: {
                              ...formData.monthlyRental,
                              limitValue: Number(e.target.value),
                            },
                          })
                        }
                      />
                    )}
                    {formData.monthlyRental.limit === "Unlimited" && (
                      <Input
                        label="Limit Value (/HR)"
                        type="number"
                        min="0"
                        required
                        value={formData.monthlyRental.limitValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyRental: {
                              ...formData.monthlyRental,
                              limitValue: Number(e.target.value),
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
                    Weekly Rental Prices ( 7 days )
                  </label>
                </div>

                {formData.weeklyRental.available && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                    <Input
                      label="Weekly Rental Prices"
                      type="number"
                      min="0"
                      required
                      value={formData.weeklyRental.rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                         weeklyRental: {
                            ...formData.weeklyRental,
                            rate: Number(e.target.value),
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
                              limit: e.target.value as "Limit Type" | "Unlimited" | "Limited",
                            },
                          })
                        }
                        className="mt-1 block p-2 border border-gray-700 dark:bg-gray-800 dark:text-white w-full rounded-2xl shadow-sm "
                      >
                        <option value="Type">Limit Type</option>
                        <option value="Unlimited">Unlimited</option>
                        <option value="Limited">Limited</option>
                      </select>
                    </div>

                    {formData.weeklyRental.limit === "Limited" && (
                      <Input
                        label="Limit Value (KM)"
                        type="number"
                        min="0"
                        required
                        value={formData.weeklyRental.limitValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                           weeklyRental: {
                              ...formData.weeklyRental,
                              limitValue: Number(e.target.value),
                            },
                          })
                        }
                      />
                    )}
                    {formData.weeklyRental.limit === "Unlimited" && (
                      <Input
                        label="Limit Value (/HR)"
                        type="number"
                        min="0"
                        required
                        value={formData.weeklyRental.limitValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                           weeklyRental: {
                              ...formData.weeklyRental,
                              limitValue: Number(e.target.value),
                            },
                          })
                        }
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
                    Home Delivery/Pickup Prices
                  </label>
                </div>

                {formData.deliveryCharges.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                    <Input
                      label="0-10 km"
                      type="number"
                      min=""
                      required
                      value={formData.deliveryCharges.charges["0-10"]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryCharges: {
                            ...formData.deliveryCharges,
                            charges: {
                              ...formData.deliveryCharges.charges,
                              "0-10": Number(e.target.value),
                            },
                          },
                        })
                      }
                    />

                    <Input
                      label="10-25 km"
                      type="number"
                      min="0"
                      required
                      value={formData.deliveryCharges.charges["10-25"]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryCharges: {
                            ...formData.deliveryCharges,
                            charges: {
                              ...formData.deliveryCharges.charges,
                              "10-25": Number(e.target.value),
                            },
                          },
                        })
                      }
                    />

                    <Input
                      label="25-50 km"
                      type="number"
                      min="0"
                      required
                      value={formData.deliveryCharges.charges["25-50"]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryCharges: {
                            ...formData.deliveryCharges,
                            charges: {
                              ...formData.deliveryCharges.charges,
                              "25-50": Number(e.target.value),
                            },
                          },
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>

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
                Upload Car
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
