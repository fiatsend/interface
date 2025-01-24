import Image from "next/image";
import React, { useState, useEffect } from "react";
import CountrySelector from "./CountrySelection";
import { Country } from "./CountrySelection";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  getAuth,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { useCheckNFTByMobile } from "@/utils/helpers/num-check";

interface MobileMoneySetupProps {
  onSubmit: (phoneNumber: string) => void;
  setConfirmationResult: React.Dispatch<
    React.SetStateAction<ConfirmationResult | null>
  >;
}

const MobileMoneySetup: React.FC<MobileMoneySetupProps> = ({
  onSubmit,
  setConfirmationResult,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const realNumber = selectedCountry?.code + phoneNumber.replace(/^0+/, "");
  const walletExists = useCheckNFTByMobile(realNumber);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA verified!");
          },
        }
      );
    }
  }, []);

  const validatePhoneNumber = (number: string) => {
    if (!selectedCountry) return false;
    const fullNumber = selectedCountry.code + number.replace(/^0+/, "");
    const phoneNumberObj = parsePhoneNumberFromString(fullNumber);
    return phoneNumberObj?.isValid() || false;
  };

  const handleSendOTP = async () => {
    const auth = getAuth();
    const appVerifier = window.recaptchaVerifier;

    if (!selectedCountry) {
      toast.error("Please select a country.");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid mobile number in E.164 format.");
      return;
    }

    const normalizedNumber = phoneNumber.replace(/^0+/, "");
    const fullNumber = `${selectedCountry.code}${normalizedNumber}`;

    try {
      setIsLoading(true);
      if (walletExists) {
        toast.error("A smart wallet is already linked to this number.");
        return; // Return early – do not proceed to send OTP
      }
      const result = await signInWithPhoneNumber(auth, fullNumber, appVerifier);
      setConfirmationResult(result);
      toast.success("OTP sent! Please check your phone.");
      onSubmit(fullNumber);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile Money Provider Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Select Country Code
        </label>
        <CountrySelector
          selectedCountry={selectedCountry}
          onSelect={setSelectedCountry}
        />
      </div>

      {/* Phone Number Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Mobile Number
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your mobile money number"
            className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-colors ${
              phoneNumber && !validatePhoneNumber(phoneNumber)
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            }`}
          />
        </div>
        {phoneNumber && !validatePhoneNumber(phoneNumber) && (
          <p className="text-sm text-red-600 mt-1">
            Please enter a valid mobile money number
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          This number will be used to receive your GHS payments
        </p>
      </div>

      {/* Provider Info */}
      {selectedCountry && (
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-start space-x-3">
            {selectedCountry.icon && (
              <Image
                src={selectedCountry.icon}
                alt={selectedCountry.name}
                width={24}
                height={24}
                className="mt-1"
              />
            )}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-purple-900">
                {selectedCountry.name}
              </h3>
              <p className="text-sm text-purple-700 mt-1">
                Your mobile number will be linked to your account
              </p>
            </div>
          </div>
        </div>
      )}

      <div id="recaptcha-container"></div>

      {/* Continue Button */}
      <button
        onClick={handleSendOTP}
        disabled={!validatePhoneNumber(phoneNumber) || isLoading}
        className={`w-full py-3 rounded-xl font-medium transition-all ${
          !validatePhoneNumber(phoneNumber) || isLoading
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
        }`}
      >
        {isLoading ? "Sending Code..." : "Continue"}
      </button>

      {/* Security Note */}
      <p className="text-xs text-gray-500 text-center">
        Your mobile money information is securely encrypted and stored on the
        blockchain
      </p>
    </div>
  );
};

export default MobileMoneySetup;
