import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Book, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-indigo-600 text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <Book className="mr-2" />
          LitArt Gallery
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-indigo-200">Home</Link></li>
            <li><Link to="/about" className="hover:text-indigo-200">About</Link></li>
            <li><Link to="/gallery" className="hover:text-indigo-200">Gallery</Link></li>
            {user ? (
              <>
                <li><Link to="/profile" className="hover:text-indigo-200"><User className="inline-block" /></Link></li>
                <li><button onClick={signOut} className="hover:text-indigo-200">Sign Out</button></li>
              </>
            ) : (
              <li><Link to="/profile" className="hover:text-indigo-200">Sign In</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;