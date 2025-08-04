"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
              Find Your{" "}
              <span className="text-yellow-400">Perfect Motorcycle</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 text-blue-100 px-4">
              Massive inventory of used motorcycles, quality guaranteed,
              transparent pricing
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-gray-900 text-base sm:text-sm">
                    <option>All Brands</option>
                    <option>Honda</option>
                    <option>Yamaha</option>
                    <option>Kawasaki</option>
                    <option>Ducati</option>
                    <option>BMW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-gray-900 text-base sm:text-sm">
                    <option>Any Price</option>
                    <option>Under $3,000</option>
                    <option>$3,000 - $8,000</option>
                    <option>$8,000 - $15,000</option>
                    <option>$15,000 - $30,000</option>
                    <option>Over $30,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engine Size
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-gray-900 text-base sm:text-sm">
                    <option>Any Engine Size</option>
                    <option>Under 125cc</option>
                    <option>125cc - 250cc</option>
                    <option>250cc - 400cc</option>
                    <option>Over 400cc</option>
                  </select>
                </div>
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <button className="w-full bg-blue-600 text-white px-6 py-3 sm:py-2 rounded-md font-medium hover:bg-blue-700 transition duration-200 text-base sm:text-sm">
                    Search Motorcycles
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Brands */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Popular Brands
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {["Honda", "Yamaha", "Kawasaki", "Ducati", "BMW", "Suzuki"].map(
              (brand) => (
                <div
                  key={brand}
                  className="text-center hover:transform hover:scale-105 transition duration-200 cursor-pointer"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-gray-600">
                      {brand.charAt(0)}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{brand}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Featured Motorcycles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Featured Motorcycles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Honda CBR600RR",
                year: "2020",
                mileage: "9,300 miles",
                price: "9,500",
                location: "New York",
                image: "bg-gradient-to-br from-red-400 to-red-600",
              },
              {
                title: "Yamaha R6",
                year: "2019",
                mileage: "13,700 miles",
                price: "7,800",
                location: "Los Angeles",
                image: "bg-gradient-to-br from-blue-400 to-blue-600",
              },
              {
                title: "Kawasaki Ninja 650",
                year: "2021",
                mileage: "5,000 miles",
                price: "6,200",
                location: "Chicago",
                image: "bg-gradient-to-br from-green-400 to-green-600",
              },
            ].map((bike, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
              >
                <div className={`h-48 ${bike.image}`}></div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {bike.title}
                  </h4>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>{bike.year}</span>
                    <span>{bike.mileage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        ${bike.price}
                      </p>
                      <p className="text-sm text-gray-500">{bike.location}</p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-md font-medium hover:bg-blue-50 transition duration-200">
              View More Motorcycles
            </button>
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Open Market
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                Quality Guaranteed
              </h4>
              <p className="text-gray-600">
                Professional inspection team ensures the quality and safety of
                every motorcycle
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                Transparent Pricing
              </h4>
              <p className="text-gray-600">
                Open and transparent pricing system with no hidden fees
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                Worry-Free Service
              </h4>
              <p className="text-gray-600">
                Comprehensive after-sales service system for worry-free
                motorcycle purchasing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-lg font-bold mb-4">Open Market</h5>
              <p className="text-gray-300 text-sm">
                Professional used motorcycle trading platform, committed to
                providing safe and convenient buying and selling services for
                users.
              </p>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">Buying Services</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    Used Motorcycles
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Brand Showcase
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Vehicle Inspection
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Financial Services
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">Selling Services</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    Free Valuation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Quick Sale
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Home Pickup
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Consignment Sales
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-4">Customer Service</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Feedback
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Legal Notice
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; 2024 Open Market. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
