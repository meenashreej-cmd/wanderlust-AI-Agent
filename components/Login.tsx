import React, { useState } from 'react';
import { mockAuth, mockRegister } from '../services/mockBackend';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form State
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegistering) {
        if (!userId || !password || !name || !email) {
          setError("All fields are required.");
          setLoading(false);
          return;
        }

        const user = await mockRegister(name, email, userId, password);
        if (user) {
          onLogin(user);
        } else {
          setError('User ID already exists. Please choose another.');
        }
      } else {
        const user = await mockAuth(userId, password);
        if (user) {
          onLogin(user);
        } else {
          setError('Invalid credentials.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    // Clear password on toggle for safety, keep userId
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">WanderLust AI</h1>
          <p className="text-gray-500 mt-2">
            {isRegistering ? 'Create your account' : 'Your Agentic Travel Companion'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegistering && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-black bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="e.g. Alice Traveler"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-black bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="e.g. alice@example.com"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-black bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="e.g. user_123"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-black bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder={isRegistering ? "Create a password" : "Enter password"}
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Log In')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
            <button 
                type="button"
                onClick={toggleMode}
                className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 transition"
            >
                {isRegistering 
                    ? "Already have an account? Log In" 
                    : "New to WanderLust? Create Account"}
            </button>
        </div>

        {!isRegistering && (
           <div className="mt-6 text-center text-xs text-gray-400">
             <p>Demo Credentials: user_123 / password</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Login;