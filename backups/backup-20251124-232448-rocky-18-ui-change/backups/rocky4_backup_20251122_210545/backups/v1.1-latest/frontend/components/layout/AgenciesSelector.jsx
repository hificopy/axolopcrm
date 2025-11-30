import { useState, useEffect } from 'react';
import { useSupabase } from '@/context/SupabaseContext';
import { ChevronDown, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AgenciesSelector = () => {
  const { user, supabase } = useSupabase();
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for agencies - in a real implementation, this would come from Supabase
  useEffect(() => {
    // In a real implementation, fetch agencies from Supabase
    // For now, using mock data to demonstrate functionality
    const mockAgencies = [
      { id: 1, name: 'My Primary Agency', isOwner: true },
      { id: 2, name: 'Client Marketing Agency', isOwner: false },
      { id: 3, name: 'Digital Solutions Co.', isOwner: true },
      { id: 4, name: 'Creative Design Studio', isOwner: false },
      { id: 5, name: 'Business Growth Partners', isOwner: true },
    ];

    setAgencies(mockAgencies);
    setSelectedAgency(mockAgencies[0]); // Set first agency as default
    setIsLoading(false);
  }, []);

  // Filter agencies based on search term
  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAgencyChange = (agency) => {
    setSelectedAgency(agency);
    setIsOpen(false);
    // In a real implementation, would update the current context/active agency
    console.log('Switched to agency:', agency);
  };

  const handleAddAgency = () => {
    // In a real implementation, would open a modal or navigate to agency creation
    console.log('Adding new agency');
    setIsOpen(false);
    // For demo purposes, we'll just log that we're adding an agency
    alert('Add new agency functionality would open here');
  };

  if (isLoading || agencies.length === 0) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center justify-between cursor-pointer rounded-lg mb-1 transition-all duration-200 ease-out overflow-hidden transform-gpu">
          <div className="flex items-center flex-1">
            <div className="p-2 rounded-lg mr-3 text-gray-400">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="font-semibold text-gray-300">
              {agencies.length === 0 ? 'No agencies' : 'Loading...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-1.5 -ml-1">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1 px-2 -ml-1 truncate">Agencies</div>
      <div className="relative">
        <div className="flex items-center">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-between cursor-pointer rounded-lg mb-1 transition-all duration-200 ease-out overflow-hidden transform-gpu border border-white/10 bg-gradient-to-r from-gray-800/60 to-gray-900/60 hover:from-white/20 hover:to-white/10 hover:text-white flex-1 shadow-sm"
              >
                <div className="flex items-center flex-1">
                  <div className={`p-1.5 rounded-lg mr-1 transition-colors duration-200 ease-out ${
                    'text-gray-400 hover:text-white'
                  }`}>
                    <Building2 className="h-4 w-4 transition-transform duration-200 ease-out" />
                  </div>
                  <span className={`text-xs font-bold transition-colors duration-200 ease-out text-gray-300 hover:text-white truncate`}>
                    {selectedAgency?.name}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-lg border border-white/10 min-w-[220px] shadow-xl rounded-lg overflow-hidden">
              <div className="p-2 border-b border-white/10 bg-black/20">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for an agency..."
                    className="w-full bg-gray-800/50 border border-white/10 rounded px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
                <div className="px-3 py-1.5 text-xs text-gray-300 uppercase tracking-wide">My agencies</div>
                {filteredAgencies.map((agency) => (
                  <DropdownMenuItem
                    key={agency.id}
                    onSelect={() => handleAgencyChange(agency)}
                    className="text-gray-300 hover:!bg-transparent hover:!text-gray-300"
                  >
                    <div className="flex items-center w-full">
                      <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate text-white">{agency.name}</div>
                        <div className="text-xs text-gray-300">
                          {agency.isOwner ? 'Agency Owner' : 'Team Member'}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={handleAddAgency}
            className="ml-2 p-2 rounded text-gray-400 hover:text-white hover:bg-white/20 transition-colors duration-200 flex items-center justify-center -mt-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgenciesSelector;