import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { user, error } = await signIn(email, password);
      if (error) throw error;
      console.log('User signed in:', user);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="email" className="block mb-1">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label htmlFor="password" className="block mb-1">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
        Sign In
      </button>
    </form>
  );
};

export default SignIn;