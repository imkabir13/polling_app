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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-80">
        <h2 className="text-xl font-bold mb-4 text-center">ভোট শুরু করুন</h2>

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
            placeholder="Enter age (17–99)"
            className="w-full border rounded px-3 py-2 text-sm"
            inputMode="numeric"
          />
          {ageError && <p className="mt-1 text-xs text-red-600">{ageError}</p>}
        </div>

        {/* Timer message */}
        {secondsLeft > 0 && secondsLeft <= 5 && (
          <p className="mt-1 text-xs text-red-600 text-right">
            Please complete within {secondsLeft} seconds.
          </p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={onStart}
            disabled={isStartDisabled}
            className={`px-4 py-2 rounded text-sm font-semibold 
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
