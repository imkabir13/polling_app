"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function PosterPage() {
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    // Get the current URL on client side
    if (typeof window !== "undefined") {
      const baseUrl = window.location.origin;
      setCurrentUrl(baseUrl);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-8 print:p-0">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-12 text-center">
          <div className="mb-4">
            <svg
              className="w-20 h-20 mx-auto mb-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            সময় এসেছে কথা বলার
          </h1>
          <p className="text-3xl font-semibold text-green-100">
            আপনার মতামতই দেশের শক্তি
          </p>
        </div>

        {/* Main Content */}
        <div className="p-12">
          {/* Introduction Text */}
          <div className="mb-10 text-center">
            <p className="text-2xl leading-relaxed text-gray-700 mb-8">
              আসন্ন গণভোট উপলক্ষে আমরা একটি নিরপেক্ষ জনমত জরিপ পরিচালনা করছি,
              যেখানে আপনার অংশগ্রহণ সংশ্লিষ্ট গবেষণা ও বিশ্লেষণে গুরুত্বপূর্ণ
              ভূমিকা রাখবে।
            </p>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 mb-10 border-2 border-green-200">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-600 text-white rounded-full p-3 mr-3">
                <svg
                  className="w-8 h-8"
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
              <p className="text-3xl font-bold text-green-800">
                👉 QR কোড স্ক্যান করে মাত্র ৩০ সেকেন্ডে আপনার মতামত দিন
              </p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="text-center mb-10">
            <div className="inline-block bg-white p-8 rounded-3xl shadow-xl border-4 border-green-500">
              {currentUrl ? (
                <QRCodeSVG
                  value={currentUrl}
                  size={320}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              ) : (
                <div className="w-80 h-80 flex items-center justify-center">
                  <p className="text-gray-400">Loading QR Code...</p>
                </div>
              )}
            </div>
          </div>

          {/* How to Participate */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              কীভাবে অংশগ্রহণ করবেন?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                  1
                </div>
                <p className="text-gray-700 font-medium">
                  মোবাইল ক্যামেরা দিয়ে QR কোড স্ক্যান করুন
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                  2
                </div>
                <p className="text-gray-700 font-medium">প্রশ্নের উত্তর দিন</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                  3
                </div>
                <p className="text-gray-700 font-medium">আপনার মতামত জমা দিন</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-base font-semibold text-red-800">
                  বিশেষ দ্রষ্টব্য:
                </p>
                <p className="text-base text-red-700 mt-1">
                  এই জনমত জরিপ বাংলাদেশ নির্বাচন কমিশন কর্তৃক ঘোষিত বা পরিচালিত
                  আনুষ্ঠানিক ভোট নয়।
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  নিরাপদ ও গোপনীয়
                </h3>
                <p className="text-sm text-gray-600">
                  আপনার তথ্য সম্পূর্ণ সুরক্ষিত এবং গোপনীয় থাকবে
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  দ্রুত ও সহজ
                </h3>
                <p className="text-sm text-gray-600">
                  মাত্র ৩০ সেকেন্ডে সম্পন্ন করুন
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  নিরপেক্ষ জরিপ
                </h3>
                <p className="text-sm text-gray-600">
                  কোনো পক্ষপাতিত্ব ছাড়াই আপনার মতামত প্রকাশ করুন
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-3">
                <svg
                  className="w-6 h-6 text-green-600"
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
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  মোবাইল বান্ধব
                </h3>
                <p className="text-sm text-gray-600">
                  যেকোনো মোবাইল থেকে সহজেই অংশগ্রহণ করুন
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 text-white text-center py-6">
          <p className="text-lg font-medium">
            আপনার প্রতিটি মতামত গুরুত্বপূর্ণ 🇧🇩
          </p>
          <p className="text-sm text-gray-400 mt-2">
            আজই অংশগ্রহণ করুন এবং দেশের ভবিষ্যৎ গড়তে সাহায্য করুন
          </p>
        </div>
      </div>

      {/* Print Button */}
      <div className="text-center mt-8 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-colors text-lg flex items-center gap-2 mx-auto"
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
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          পোস্টার প্রিন্ট করুন
        </button>
      </div>
    </div>
  );
}
