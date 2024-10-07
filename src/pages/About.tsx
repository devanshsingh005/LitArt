import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">About LitArt Gallery</h1>
      <p className="mb-4">
        LitArt Gallery is a unique platform that brings together the worlds of literature and visual arts. 
        Born from the creative minds of our literature club members, this gallery showcases a diverse range 
        of artwork inspired by the written word.
      </p>
      <p className="mb-4">
        Our mission is to provide a space where literature enthusiasts can express themselves through various 
        art forms, and where art lovers can discover pieces that tell stories beyond the canvas.
      </p>
      <h2 className="text-2xl font-semibold mt-8 mb-4">Our Activities</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Monthly themed art challenges based on literary works</li>
        <li>Workshops on various art techniques and styles</li>
        <li>Collaborative projects between writers and artists</li>
        <li>Annual LitArt Festival showcasing the best works of the year</li>
      </ul>
      <h2 className="text-2xl font-semibold mt-8 mb-4">Meet Our Artists</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <img src="https://source.unsplash.com/random/200x200?portrait" alt="Artist 1" className="w-32 h-32 rounded-full mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-center">Jane Doe</h3>
          <p className="text-center text-gray-600">Watercolor Specialist</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <img src="https://source.unsplash.com/random/200x200?portrait" alt="Artist 2" className="w-32 h-32 rounded-full mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-center">John Smith</h3>
          <p className="text-center text-gray-600">Digital Illustrator</p>
        </div>
      </div>
    </div>
  );
};

export default About;