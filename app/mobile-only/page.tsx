"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function MobileOnlyPage() {
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    // Get the current URL on client side
    if (typeof window !== "undefined") {
      // Use the base URL without /mobile-only path
      const baseUrl = window.location.origin;
      setCurrentUrl(baseUrl);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full">
            <svg
              className="w-12 h-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          মোবাইল ডিভাইস প্রয়োজন
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8">
          এই জনমত জরিপে অংশগ্রহণ করতে অনুগ্রহ করে আপনার মোবাইল ফোন ব্যবহার করুন।
        </p>

        {/* QR Code */}
        {currentUrl && (
          <div className="mb-8">
            <div className="inline-block p-6 bg-white border-4 border-gray-200 rounded-xl shadow-md">
              <QRCodeSVG
                value={currentUrl}
                size={256}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-3 text-left bg-gray-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">
            কীভাবে ভোট দেবেন:
          </h2>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              1
            </span>
            <p className="text-gray-700 pt-1">
              আপনার মোবাইল ফোনের ক্যামেরা অ্যাপ খুলুন
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              2
            </span>
            <p className="text-gray-700 pt-1">
              উপরের QR কোডটি স্ক্যান করুন
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              3
            </span>
            <p className="text-gray-700 pt-1">
              আপনার মোবাইল ব্রাউজারে ওয়েবসাইট খুলুন এবং ভোট দিন
            </p>
          </div>
        </div>

        {/* Alternative Link */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            অথবা এই লিংক টি আপনার মোবাইলে পাঠান:
          </p>
          <div className="bg-gray-100 px-4 py-3 rounded-lg">
            <code className="text-sm text-blue-600 font-mono break-all">
              {currentUrl || "Loading..."}
            </code>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
          <p className="text-sm text-yellow-800">
            <strong>দ্রষ্টব্য:</strong> নিরাপত্তা এবং সঠিক ভোট নিশ্চিত করতে এই জরিপ
            শুধুমাত্র মোবাইল ডিভাইস থেকে অ্যাক্সেস করা যাবে।
          </p>
        </div>
      </div>
    </div>
  );
}
