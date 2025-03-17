import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Save, Plus, Trash } from "lucide-react";
import { RootState, AppDispatch } from "../store/store";
import { fetchProfile, updateProfile } from "../store/slices/profileSlice";
import { Input } from "../components/Input";

export function ProfilePage() {
  const dispatch: AppDispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cities, setCities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Reference for dropdown
  const inputRef = useRef<HTMLInputElement>(null); // Reference for input

  useEffect(() => {
    async function fetchCities(query = "New") {
      // Default query to get initial results
      try {
        const response = await fetch(
          `https://zymo-partner-app-omega.vercel.app/indian-cities?query=${query}`
        );
        const data = await response.json();
        const cityNames = data.cities.map((city: string) =>
          city.split(",")[0].trim()
        );

        setCities(cityNames || []);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    }

    if (searchTerm.length > 1) {
      fetchCities(searchTerm); // Fetch when typing
    }
  }, [searchTerm]);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile && !profile.loading) {
      setFormData(profile);
    }
  }, [profile]);

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

  const handleSave = async () => {
    await dispatch(updateProfile(formData));
    setIsEditing(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectChange = (city: string) => {
    const newCities = formData.cities.includes(city)
      ? formData.cities.filter((c) => c !== city)
      : [...formData.cities, city];

    setFormData({ ...formData, cities: newCities });
  };

  const addMoreCities = async () => {
    setIsDropdownOpen(true);
  };

  const deleteCity = async (city: string) => {
    // Remove the city from the local state
    const updatedCities = formData.cities.filter((c) => c !== city);
    setFormData({ ...formData, cities: updatedCities });
  
    // Update Firebase
    await dispatch(updateProfile({ ...formData, cities: updatedCities }));
  };

  const filteredCities = cities.filter((city: string) =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (profile.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime"></div>
      </div>
    );
  }

  return (
    <div className="bg-lime rounded-2xl dark:bg-transparent">
      <div className="max-w-4xl mx-auto px-4 py-8 text-lime-400 ">
        <div className="dark:bg-darkgray bg-white rounded-2xl shadow-lg p-6 animate-slide-in border border-lime ">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4 ">
              <div className="bg-lime-200 text-darklime dark:text-lime p-3 rounded-full">
                <User className="h-6 w-6 text-lime-600" />
              </div>
              <h1 className="text-2xl font-bold dark:text-lime text-darklime">
                Profile Settings
              </h1>
            </div>
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="flex items-center space-x-2 font-semibold bg-lime px-4 py-2 rounded-full"
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
            </button>
          </div>

          {/* Profile Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <Input
              label={
                <span className="text-darklime dark:text-lime">Email</span>
              }
              type="email"
              value={formData.username}
              onChange={(e: { target: { value: any; }; }) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <Input
              label={
                <span className="text-darklime dark:text-lime">Brand Name</span>
              }
              value={formData.brandName}
              onChange={(e: { target: { value: any; }; }) =>
                setFormData({ ...formData, brandName: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <Input
              label={
                <span className="text-darklime dark:text-lime">
                  Contact Number
                </span>
              }
              type="tel"
              value={formData.phone}
              onChange={(e: { target: { value: any; }; }) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <Input
              label={
                <span className="text-darklime dark:text-lime">GST Number</span>
              }
              value={formData.gstNumber}
              onChange={(e: { target: { value: any; }; }) =>
                setFormData({ ...formData, gstNumber: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <Input
              label={
                <span className="text-darklime dark:text-lime">
                  Bank Account Name
                </span>
              }
              value={formData.bankAccountName}
              onChange={(e: { target: { value: any; }; }) =>
                setFormData({ ...formData, bankAccountName: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <Input
              label={
                <span className="text-darklime dark:text-lime">
                  Bank Account Number
                </span>
              }
              value={formData.bankAccount}
              onChange={(e: { target: { value: any; }; }) =>
                setFormData({ ...formData, bankAccount: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <Input
              label={
                <span className="text-darklime dark:text-lime">IFSC Code</span>
              }
              value={formData.ifscCode}
              onChange={(e: { target: { value: any; }; }) =>
                setFormData({ ...formData, ifscCode: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <div>
              <div className="my-4 mx-1 text-darklime dark:text-lime ">
                Logo
                {profile.logo ? (
                  <img
                    src={profile.logo}
                    alt="Brand Logo"
                    className="w-32 h-32 object-contain rounded-lg mt-1"
                  />
                ) : (
                  <p className="text-gray-400">No logo uploaded</p>
                )}
              </div>
            </div>
          </div>

          {/* Cities Operated Section */}
          <div className="mt-6">
            <div>
              <label className="block text-sm font-medium text-darklime dark:text-lime m-1">
                Cities Operated
              </label>
              {isEditing && (
                <div className="flex gap-2 my-4 dark:text-white">
                  <button
                    className="bg-lime rounded-full p-1"
                    onClick={addMoreCities}
                  >
                    <Plus className="text-darkgray" />
                  </button>
                  <label className="mt-1">Add more cities</label>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.cities.map((city) => (
                <div
                  key={city}
                  className="px-3 py-2 bg-lime rounded-full flex justify-between text-sm"
                >
                  {city}
                  {isEditing && <button onClick={()=>deleteCity(city)}>
                  <Trash className="dark:text-darkgray"/>
                  </button>}
                  
                </div>
              ))}
            </div>

            {/* Dropdown for adding more cities */}
            {isDropdownOpen && (
              <div ref={dropdownRef} className="relative w-full mt-4 z-40">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="mt-1 pl-3 block border text-white border-gray-500 rounded-2xl p-2 dark:bg-lightgray dark:border-gray-700 shadow-sm focus:ring-lime focus:border-lime"
                  placeholder="Search cities..."
                />
                <div className="absolute left-0 bg-white/90 w-full mt-1 dark:bg-lightgray border dark:text-white border-lime rounded-2xl shadow-lg max-h-60 overflow-y-auto z-50">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCities.map((city) => (
                      <div
                        key={city}
                        className="flex items-center space-x-2 p-2 hover:bg-lime/30 cursor-pointer"
                        onClick={() => handleSelectChange(city)}
                      >
                        <span className="text-sm">{city}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
