import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { Upload as UploadIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Upload: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to upload artwork.');
      return;
    }

    if (!image) {
      setError('Please select an image to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Upload image to Supabase Storage
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: imageData, error: imageError } = await supabase.storage
        .from('artwork-images')
        .upload(fileName, image);

      if (imageError) throw imageError;

      // Get public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('artwork-images')
        .getPublicUrl(fileName);

      if (!publicUrlData) throw new Error('Failed to get public URL for the image');

      // Insert artwork data into the database
      const { data, error } = await supabase
        .from('artworks')
        .insert({
          title,
          description,
          category,
          price: parseFloat(price),
          image_url: publicUrlData.publicUrl,
          user_id: user.id,
        })
        .select();

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      setSuccess('Artwork uploaded successfully!');
      // Reset form fields
      setTitle('');
      setDescription('');
      setCategory('');
      setPrice('');
      setImage(null);
    } catch (error) {
      console.error('Error uploading artwork:', error);
      setError(error.message || 'An error occurred while uploading. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  if (!user) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">You must be logged in to upload artwork</h2>
        <button
          onClick={() => navigate('/profile')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Artwork</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="description" className="block mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          ></textarea>
        </div>
        <div>
          <label htmlFor="category" className="block mb-1">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select a category</option>
            <option value="painting">Painting</option>
            <option value="digital">Digital Art</option>
            <option value="sculpture">Sculpture</option>
            <option value="photography">Photography</option>
          </select>
        </div>
        <div>
          <label htmlFor="price" className="block mb-1">Price ($)</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="image" className="block mb-1">Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
        >
          <UploadIcon className="mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Artwork'}
        </button>
      </form>
    </div>
  );
};

export default Upload;