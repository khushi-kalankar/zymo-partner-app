import React, { useState, useEffect, useCallback } from "react";

interface PickupFormProps {
  onLocationChange: (location: string) => void;
}

const PickupForm: React.FC<PickupFormProps> = ({ onLocationChange }) => {
  const [address, setAddress] = useState<string>("");

  const initializeAutocomplete = useCallback(() => {
    if (typeof window !== "undefined" && window.google) {
      const input = document.getElementById("autocomplete") as HTMLInputElement;
      const options = {
        types: ["geocode"],
        componentRestrictions: { country: "IN" },
      };

      const autocompleteInstance = new window.google.maps.places.Autocomplete(input, options);
      autocompleteInstance.addListener("place_changed", () => {
        const place = autocompleteInstance.getPlace();
        if (place?.formatted_address) {
          setAddress(place.formatted_address);
          onLocationChange(place.formatted_address);
        }
      });
    }
  }, [onLocationChange]);

  useEffect(() => {
    initializeAutocomplete();
  }, [initializeAutocomplete]);

  return (
    <div className="p-1">
      <h2 className="mb-4 dark:text-white">Pickup Location</h2>
      <div className="mb-4">
        <input
          id="autocomplete"
          type="text"
          className="w-full p-2 border dark:bg-gray-800 dark:text-white border-gray-500 rounded-2xl"
          placeholder="Search for pickup location in India"
        />
      </div>     
    </div>
  );
};

export default PickupForm;
