import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<string>('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkPasswordStrength(password);
  }, [password]);

  const checkPasswordStrength = (password: string) => {
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
    const mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

    if (strongRegex.test(password)) {
      setPasswordStrength('strong');
    } else if (mediumRegex.test(password)) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('weak');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordStrength !== 'strong') {
      setError('Please choose a stronger password.');
      return;
    }

    try {
      console.log('Attempting to sign up user:', email);
      const { user, error: signUpError } = await signUp(email, password);
      if (signUpError) {
        if (signUpError.message === 'email_address_not_authorized') {
          throw new Error('This email address is not authorized for registration. Please contact the administrator.');
        }
        throw signUpError;
      }

      console.log('Sign up successful, user:', user);

      if (user) {
        console.log('Creating profile for user:', user.id);
        // Create profile in Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name,
            email,
            bio,
          })
          .select();

        if (profileError) {
          console.error('Error creating profile:', profileError);
          if (profileError.code === '42501') {
            throw new Error('Unable to create profile. Please try logging in.');
          } else {
            throw profileError;
          }
        }

        console.log('Profile created successfully:', profileData);

        setSuccess('Registration successful! Please check your email to confirm your account.');
        setEmail('');
        setPassword('');
        setName('');
        setBio('');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <div>
        <label htmlFor="name" className="block mb-1">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
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
        <p className="text-sm text-gray-600 mt-1">
          Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
        </p>
        <div className="mt-2">
          <div className={`h-2 ${passwordStrength === 'weak' ? 'bg-red-500' : passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%'}}></div>
        </div>
        <p className={`text-sm ${passwordStrength === 'weak' ? 'text-red-500' : passwordStrength === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
          {passwordStrength === 'weak' ? 'Weak' : passwordStrength === 'medium' ? 'Medium' : 'Strong'}
        </p>
      </div>
      <div>
        <label htmlFor="bio" className="block mb-1">Bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
        ></textarea>
      </div>
      <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
        Register
      </button>
    </form>
  );
};

export default Register;