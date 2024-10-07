import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to LitArt Gallery</h1>
      <p className="text-xl mb-8">Discover unique artwork from our talented literature club members.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Featured Artwork</h2>
          <img src="https://source.unsplash.com/random/800x600?artwork" alt="Featured Artwork" className="w-full h-64 object-cover rounded-md mb-4" />
          <Link to="/gallery" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            Explore Gallery
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">About Our Club</h2>
          <p className="mb-4">Learn more about our literature club and the talented artists behind the artwork.</p>
          <Link to="/about" className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
            About Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;