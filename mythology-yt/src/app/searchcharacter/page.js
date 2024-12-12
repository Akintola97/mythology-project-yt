"use client";

import axios from "axios";
import { CircularProgress } from "@mui/material";
import { useState } from "react";
import Image from "next/image";

export default function SearchCharacter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [character, setCharacter] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);
    setCharacter(null);

    try {
      const response = await axios.post("/api/character", {
        search: searchTerm,
      });
      setCharacter(response.data);
    } catch (error) {
      console.error("Error fetching character data:", error);
      setError("Failed to fetch character data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setCharacter(null);
    setError(null);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start dark:bg-gray-900 dark:text-gray-100 bg-gray-100 text-gray-900 pt-[8vh]">
      <div className="w-full h-auto flex justify-center items-center px-4 py-6">
        <form
          onSubmit={handleSearch}
          className="w-full max-w-lg flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0 relative"
        >
          <div className="w-full relative">
            <input
              type="text"
              placeholder="Search for a character..."
              className="flex-grow w-full p-3 text-lg rounded-md shadow-md border dark:border-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 pr-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 p-2 rounded-full shadow-md transition-all duration-200 ease-in-out focus:outline-none"
                onClick={handleClear}
                aria-label="Clear Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-3 rounded-md shadow-md font-semibold transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>
      {loading && (
        <div className="flex justify-center items-center w-full min-h-[50vh]">
          <CircularProgress />
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 w-full px-4">{error}</div>
      )}
      {character && !loading && (
        <div className="flex-grow flex justify-center items-center w-full px-4 py-8">
          <div className="w-full max-w-5xl flex flex-col lg:flex-row rounded-lg shadow-lg overflow-hidden gap-6 lg:gap-8">
            <div className="relative w-full lg:w-1/2 h-[75vh] sm:h-[80vh] lg:h-[85vh]">
              <Image
                src={`${character.imageUrl}`}
                alt={character.name}
                layout="fill"
                objectFit="cover"
                priority={true}
                className="rounded-lg"
              />
            </div>

            <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col backdrop-blur-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
              <div className="sticky top-0 bg-gray-100 dark:bg-gray-900 z-10 p-4 rounded-md">
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-500 dark:text-blue-400 capitalize">
                  {character.name}
                </h1>
              </div>
              <div className="p-4 overflow-y-auto max-h-[300px] sm:max-h-[400px] prose dark:prose-invert">
                <p className="mt-4">{character.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
