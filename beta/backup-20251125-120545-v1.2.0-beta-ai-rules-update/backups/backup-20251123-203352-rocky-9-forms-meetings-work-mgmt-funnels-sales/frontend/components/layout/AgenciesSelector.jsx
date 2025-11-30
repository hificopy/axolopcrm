import { useState, useEffect } from 'react';
import { useAgency } from '@/context/AgencyContext';
import { ChevronDown, Building2, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AgenciesSelector = () => {
  const {
    agencies,
    currentAgency,
    switchAgency,
    loading,
    createAgency
  } = useAgency();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter agencies based on search term
  const filteredAgencies = agencies.filter(agency =>
    agency.agency_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAgencyChange = async (agencyId) => {
    await switchAgency(agencyId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddAgency = () => {
    setIsOpen(false);
    setShowCreateModal(true);
  };

  const handleCreateAgency = async (name) => {
    try {
      await createAgency({ name });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating agency:', error);
      alert('Failed to create agency. Please try again.');
    }
  };

  if (loading || agencies.length === 0) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center justify-between cursor-pointer rounded-lg mb-1 transition-all duration-200 ease-out overflow-hidden transform-gpu">
          <div className="flex items-center flex-1">
            <div className="p-2 rounded-lg mr-3 text-gray-400">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="font-semibold text-gray-300">
              {agencies.length === 0 ? 'No agency' : 'Loading...'}
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
                    {currentAgency?.name || 'Select Agency'}
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
                {filteredAgencies.length === 0 && searchTerm && (
                  <div className="px-3 py-2 text-xs text-gray-400">
                    No agencies found
                  </div>
                )}
                {filteredAgencies.map((agency) => (
                  <DropdownMenuItem
                    key={agency.agency_id}
                    onSelect={() => handleAgencyChange(agency.agency_id)}
                    className="text-gray-300 hover:!bg-transparent hover:!text-gray-300"
                  >
                    <div className="flex items-center w-full">
                      {agency.agency_logo_url ? (
                        <img
                          src={agency.agency_logo_url}
                          alt={agency.agency_name}
                          className="h-6 w-6 rounded mr-2 object-cover"
                        />
                      ) : (
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate text-white">{agency.agency_name}</div>
                        <div className="text-xs text-gray-300">
                          {agency.user_role === 'admin' ? 'Agency Admin' : agency.user_role === 'member' ? 'Team Member' : 'Viewer'}
                        </div>
                      </div>
                      {currentAgency?.id === agency.agency_id && (
                        <div className="ml-2 h-2 w-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={handleAddAgency}
            className="ml-2 p-2 rounded text-gray-400 hover:text-white hover:bg-white/20 transition-colors duration-200 flex items-center justify-center -mt-0.5"
            title="Create new agency"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Create Agency Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1d24] border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Create New Agency</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const name = formData.get('name');
                if (name) {
                  handleCreateAgency(name);
                }
              }}
            >
              <div className="mb-4">
                <label htmlFor="agency-name" className="block text-sm font-medium text-gray-300 mb-2">
                  Agency Name
                </label>
                <input
                  type="text"
                  id="agency-name"
                  name="name"
                  required
                  className="w-full bg-gray-800/50 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter agency name"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition-colors"
                >
                  Create Agency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgenciesSelector;