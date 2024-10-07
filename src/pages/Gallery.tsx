import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Filter } from 'lucide-react';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  image_url: string;
  category: string;
}

const Gallery: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setArtworks(data);
      setFilteredArtworks(data);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  useEffect(() => {
    let filtered = artworks;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(artwork => artwork.category === selectedCategory);
    }

    if (sortBy === 'title-asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title-desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'artist') {
      filtered.sort((a, b) => a.artist.localeCompare(b.artist));
    }

    setFilteredArtworks(filtered);
  }, [selectedCategory, sortBy, artworks]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Art Gallery</h1>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Filter className="mr-2" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md px-2 py-1"
          >
            <option value="all">All Categories</option>
            <option value="painting">Painting</option>
            <option value="digital">Digital Art</option>
            <option value="sculpture">Sculpture</option>
          </select>
        </div>
        <div className="flex items-center">
          <label htmlFor="sort" className="mr-2">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-md px-2 py-1"
          >
            <option value="newest">Newest</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="artist">Artist</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredArtworks.map((artwork) => (
          <div key={artwork.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={artwork.image_url} alt={artwork.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{artwork.title}</h3>
              <p className="text-gray-600 mb-2">by {artwork.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;