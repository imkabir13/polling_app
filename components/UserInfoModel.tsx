// components/HomePollModal.tsx
"use client";

import React from "react";

type Gender = "male" | "female" | null;

interface UserInfoModelProps {
  open: boolean;
  gender: Gender;
  age: string;
  ageError: string;
  secondsLeft: number;

  isStartDisabled: boolean;
  onGenderChange: (gender: Exclude<Gender, null>) => void;
  onAgeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onStart: () => void;
}

export default function UserInfoModel({
  open,
  gender,
  age,
  ageError,
  secondsLeft,
  isStartDisabled,
  onGenderChange,
  onAgeChange,
  onClose,
  onStart,
}: UserInfoModelProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto"
      style={{ touchAction: "none" }} // Prevent scroll on background
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-80 m-4 max-w-full relative">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">আপনার তথ্য</h2>

        {/* Gender Selection */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">
            লিঙ্গ নির্বাচন করুন <span className="text-red-500">*</span>
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onGenderChange("male")}
              className={`flex-1 py-2 rounded-lg border text-sm font-semibold
                ${
                  gender === "male"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-200 text-gray-800 border-gray-300"
                }
              `}
            >
              পুরুষ
            </button>
            <button
              type="button"
              onClick={() => onGenderChange("female")}
              className={`flex-1 py-2 rounded-lg border text-sm font-semibold
                ${
                  gender === "female"
                    ? "bg-pink-600 text-white border-pink-600"
                    : "bg-gray-200 text-gray-800 border-gray-300"
                }
              `}
            >
              মহিলা
            </button>
          </div>
        </div>

        {/* Age Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            বয়স <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={age}
            onChange={onAgeChange}
            placeholder="আপনার বয়স এখানে লিখুন"
            className="w-full border rounded px-3 py-2 text-base"
            inputMode="numeric"
            autoComplete="off"
            style={{ fontSize: "16px" }} // Prevent zoom on iOS
          />
          {ageError && <p className="mt-1 text-xs text-red-600">{ageError}</p>}
        </div>

        {/* Timer message */}
        {secondsLeft > 0 && secondsLeft <= 5 && (
          <p className="mt-1 text-xs text-red-600 text-right">
            Please complete within {secondsLeft} seconds.
          </p>
        )}

        {/* Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={onStart}
            disabled={isStartDisabled}
            className={`w-full px-4 py-2 rounded text-sm font-semibold
              ${
                isStartDisabled
                  ? "bg-blue-300 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            ভোট শুরু করুন
          </button>
        </div>
      </div>
    </div>
  );
}
