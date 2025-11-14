import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '@branding/LOGO/transparent-logo.png';
import background from '@branding/banner/background.png';

const BetaLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password === 'katewife') {
      // Set a session variable or local storage to remember login state
      sessionStorage.setItem('betaAccess', 'true');
      navigate('/inbox'); // Go directly to CRM dashboard
    } else {
      setError('Incorrect password. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={logo} 
              alt="Axolop CRM Logo" 
              className="w-32 h-32 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-[#101010] mb-2">Axolop CRM</h1>
          <p className="text-gray-600 font-medium">Under Construction - Beta Access</p>
        </div>

        <p className="text-center text-gray-700 mb-6 text-sm">
          Welcome to the Axolop CRM beta. Please enter the access password.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Beta Access Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b1c14] focus:border-[#7b1c14] outline-none transition shadow-sm"
              placeholder="Enter access password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#7b1c14] hover:bg-[#651610] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying Access...
              </>
            ) : (
              'Access Dashboard →'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            This is a private beta for authorized users only
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            Axolop CRM v1.0.0-alpha
          </p>
        </div>
      </div>
    </div>
  );
};

export default BetaLogin;