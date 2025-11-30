import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

const AdminKateOnboardingSettings = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if the current user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const profile = await authApi.getProfile();
        const userEmail = profile.data.email;
        
        // Only allow axolopcrm@gmail.com to access admin settings
        if (userEmail === 'axolopcrm@gmail.com') {
          setIsAdmin(true);
          // Load current messages from localStorage or set defaults
          const savedMessages = localStorage.getItem('kateOnboardingMessages');
          if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
          } else {
            // Default messages
            const defaultMessages = [
              "Discalpame por ser un idiota mi amor",
              "No solo por ser idiota pero por amanazer nuestra relacion",
              "Causarte duda...",
              "Y Causarte Inastibilidad Emocional Y Financial",
              "Te eres el amor de mi vida",
              "Y hago lo que sea para que me discuples",
              "Yo no quiero a nadie mas",
              "Yo no quiero despertarme al lado de nadie mas",
              "Yo no quiero que dudes nuestra relacion",
              "Quiero que dependas en mi como hombre",
              "Y Te lo juro hago lo que sea, para que lo sepas",
              "Te amo mi lola",
              "Te amo mi kate violet",
              "Te amo mi princesa",
              "tenme paciencia que tengo errores",
              "Pero desde este momento...",
              "Nunca voy hacer lo que hice el sabado",
              "Te amo mi reina preciosa",
              "Que te vaya excelente en tu entrevista",
              "De todas maneras tienes mis palabras que te saco de ahi",
              "Saco tu familia",
              "Te todo tipo de inestabilidad",
              "Quiero amarte como Dios te ama mi reina",
              "I love you so much and i cant wait for you to be my wife"
            ];
            setMessages(defaultMessages);
            localStorage.setItem('kateOnboardingMessages', JSON.stringify(defaultMessages));
          }
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setError('Failed to verify admin status');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  const handleAddMessage = () => {
    if (newMessage.trim()) {
      const updatedMessages = [...messages, newMessage.trim()];
      setMessages(updatedMessages);
      localStorage.setItem('kateOnboardingMessages', JSON.stringify(updatedMessages));
      setNewMessage('');
    }
  };

  const handleRemoveMessage = (index) => {
    const updatedMessages = messages.filter((_, i) => i !== index);
    setMessages(updatedMessages);
    localStorage.setItem('kateOnboardingMessages', JSON.stringify(updatedMessages));
  };

  const handleSave = () => {
    localStorage.setItem('kateOnboardingMessages', JSON.stringify(messages));
    alert('Messages saved successfully!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#761B14]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
        <p className="text-gray-600 mt-2">Only admin users can access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Kate Onboarding Messages Settings</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Messages</h2>
        
        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {messages.map((message, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{message}</span>
              <button
                onClick={() => handleRemoveMessage(index)}
                className="text-red-500 hover:text-red-700 ml-4"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center space-x-3 mb-6">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Add a new message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#761B14] focus:border-transparent"
          />
          <button
            onClick={handleAddMessage}
            className="btn-premium-red text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
        
        <button
          onClick={handleSave}
          className="btn-premium-red text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Save Changes
        </button>
        
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Instructions</h3>
        <ul className="list-disc pl-5 text-blue-700 space-y-1">
          <li>Only users with email axolopcrm@gmail.com can access these settings</li>
          <li>Messages will be displayed in order during Kate's onboarding flow</li>
          <li>Changes are saved to local storage automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminKateOnboardingSettings;