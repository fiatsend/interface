import Image from "next/image";
import React, { useState } from "react";

export interface Country {
  name: string;
  code: string;
  icon?: string; // Add icon property as optional
  flag: string; // URL to the flag image
}

const countries: Country[] = [
  { code: "+233", name: "Ghana", flag: "/images/flags/ghana.png" },
  { code: "+254", name: "Kenya", flag: "/images/flags/kenya.png" },
  { code: "+255", name: "Tanzania", flag: "/images/flags/tanzania.png" },
  { code: "+256", name: "Uganda", flag: "/images/flags/uganda.png" },
];

interface CountrySelectorProps {
  selectedCountry: Country | null;
  onSelect: (country: Country) => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (country: Country) => {
    onSelect(country);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 border rounded-lg bg-white shadow-md"
      >
        <div className="flex items-center">
          {selectedCountry && (
            <>
              <Image
                width={25}
                height={25}
                src={selectedCountry.flag}
                alt={selectedCountry.name}
                className="w-6 h-6 mr-2"
              />
              <span>
                {selectedCountry.name} ({selectedCountry.code})
              </span>
            </>
          )}
          {!selectedCountry && <span>Select Country</span>}
        </div>
        {/* <span className="material-icons">V</span> */}
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {countries.map((country) => (
            <button
              key={country.code}
              onClick={() => handleSelect(country)}
              className="flex items-center w-full p-3 hover:bg-gray-100"
            >
              <Image
                width={25}
                height={25}
                src={country.flag}
                alt={country.name}
                className="w-6 h-6 mr-2"
              />
              <span>
                {country.name} ({country.code})
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
