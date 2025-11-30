import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useToast } from './ui/use-toast';
import api from '@/lib/api';

const LeadImportModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState('custom');
  const [csvFile, setCsvFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({}); // { csvHeader: crmField }
  const [customFields, setCustomFields] = useState([]); // [{ id: 1, name: 'Custom 1' }]
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const CRM_FIELDS = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'website', label: 'Website' },
  ];

  const fetchPresets = useCallback(async () => {
    try {
      const response = await api.get('/leads/presets');
      setPresets(response.data);
    } catch (error) {
      console.error('Error fetching presets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load import presets.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchPresets();
    }
  }, [isOpen, fetchPresets]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      parseCsvHeaders(file);
    } else {
      setCsvFile(null);
      setCsvHeaders([]);
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      });
    }
  };

  const parseCsvHeaders = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim());
        setCsvHeaders(headers);
        // Initialize mapping with default or empty values
        const initialMapping = {};
        headers.forEach(header => {
          const crmField = CRM_FIELDS.find(field => field.label.toLowerCase() === header.toLowerCase());
          initialMapping[header] = crmField ? crmField.key : '';
        });
        setColumnMapping(initialMapping);
      }
    };
    reader.readAsText(file);
  };

  const handleColumnMappingChange = (csvHeader, crmFieldKey) => {
    setColumnMapping(prev => ({ ...prev, [csvHeader]: crmFieldKey }));
  };

  const handleAddCustomField = () => {
    setCustomFields(prev => [...prev, { id: prev.length + 1, name: `Custom ${prev.length + 1}` }]);
  };

  const handleCustomFieldNameChange = (id, newName) => {
    setCustomFields(prev => prev.map(field => field.id === id ? { ...field, name: newName } : field));
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      toast({
        title: 'Missing Preset Name',
        description: 'Please enter a name for your preset.',
        variant: 'destructive',
      });
      return;
    }
    try {
      setIsLoading(true);
      const payloadMapping = {};
      Object.entries(columnMapping).forEach(([csvHeader, crmField]) => {
        if (crmField) { // Only save mapped fields
          payloadMapping[csvHeader] = crmField;
        }
      });
      customFields.forEach(cf => {
        if (cf.name) {
          payloadMapping[cf.name] = cf.name.toLowerCase().replace(/\s/g, '_'); // Simple slug for custom fields
        }
      });

      await api.post('/leads/presets', {
        presetName,
        source: selectedSource,
        mapping: payloadMapping,
      });
      toast({
        title: 'Success',
        description: 'Preset saved successfully!',
      });
      fetchPresets();
      setPresetName('');
    } catch (error) {
      console.error('Error saving preset:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preset.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPreset = (presetId) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setColumnMapping(preset.mapping);
      setSelectedSource(preset.source);
      // Reconstruct custom fields from mapping if needed
      const newCustomFields = Object.entries(preset.mapping)
        .filter(([csvHeader, crmField]) => !CRM_FIELDS.some(f => f.key === crmField))
        .map(([csvHeader, crmField], index) => ({ id: index + 1, name: csvHeader }));
      setCustomFields(newCustomFields);
      toast({
        title: 'Preset Loaded',
        description: `Preset "${preset.preset_name}" loaded successfully.`, 
      });
    }
  };

  const handleDeletePreset = async (presetId) => {
    try {
      setIsLoading(true);
      await api.delete(`/leads/presets/${presetId}`);
      toast({
        title: 'Success',
        description: 'Preset deleted successfully!',
      });
      fetchPresets();
      if (selectedPreset === presetId) {
        setSelectedPreset('');
        setColumnMapping({});
        setCustomFields([]);
      }
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete preset.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportLeads = async () => {
    if (!csvFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a CSV file to import.',
        variant: 'destructive',
      });
      return;
    }

    // Basic validation for Name and Email
    const hasNameMapping = Object.values(columnMapping).includes('name');
    const hasEmailMapping = Object.values(columnMapping).includes('email');

    if (!hasNameMapping || !hasEmailMapping) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please map "Name" and "Email Address" columns.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('csvFile', csvFile);
      formData.append('mapping', JSON.stringify(columnMapping)); // Send the mapping

      const response = await api.post('/leads/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Import Successful',
        description: `${response.data.count} leads imported successfully!`,
      });
      setIsOpen(false);
      // Optionally, refresh leads list in parent component
    } catch (error) {
      console.error('Error importing leads:', error);
      toast({
        title: 'Import Failed',
        description: error.response?.data?.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Leads</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Import Source Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="source" className="text-right">Import From</Label>
            <RadioGroup
              defaultValue="custom"
              value={selectedSource}
              onValueChange={setSelectedSource}
              className="flex items-center space-x-4 col-span-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="apollo" id="apollo" />
                <Label htmlFor="apollo">Apollo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hunterio" id="hunterio" />
                <Label htmlFor="hunterio">Hunter.io</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="evaboot" id="evaboot" />
                <Label htmlFor="evaboot">Evaboot</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Custom CSV</Label>
              </div>
            </RadioGroup>
          </div>

          {/* File Upload */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="csvFile" className="text-right">CSV File</Label>
            <Input id="csvFile" type="file" accept=".csv" onChange={handleFileChange} className="col-span-3" />
          </div>

          {/* Preset Management */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="preset" className="text-right">Load Preset</Label>
            <Select onValueChange={handleLoadPreset} value={selectedPreset}>
              <SelectTrigger className="col-span-2">
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent>
                {presets.map(preset => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.preset_name} ({preset.source})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPreset && (
              <Button variant="destructive" size="sm" onClick={() => handleDeletePreset(selectedPreset)} disabled={isLoading}>
                Delete
              </Button>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="presetName" className="text-right">Save Preset As</Label>
            <Input
              id="presetName"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Enter preset name"
              className="col-span-2"
            />
            <Button onClick={handleSavePreset} disabled={isLoading}>Save Preset</Button>
          </div>

          {/* Custom Column Mapping (only for Custom source and if file uploaded) */}
          {selectedSource === 'custom' && csvHeaders.length > 0 && (
            <div className="mt-4 border p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Column Mapping</h3>
              <p className="text-sm text-gray-500 mb-4">Map your CSV columns to CRM fields. Unmapped columns will be saved as custom fields.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="font-medium">CSV Header</div>
                <div className="font-medium">CRM Field</div>
                {csvHeaders.map((header, index) => (
                  <React.Fragment key={index}>
                    <Label className="capitalize">{header}</Label>
                    <Select
                      value={columnMapping[header]}
                      onValueChange={(value) => handleColumnMappingChange(header, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select CRM Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">(Skip Column)</SelectItem>
                        {CRM_FIELDS.map(field => (
                          <SelectItem key={field.key} value={field.key}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </React.Fragment>
                ))}
              </div>

              {/* Custom Fields (dynamic input for custom field names) */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-md font-semibold mb-2">Additional Custom Fields</h4>
                <p className="text-sm text-gray-500 mb-2">These will be automatically detected if not mapped above. You can also define them here.</p>
                {customFields.map(field => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                    <Input
                      value={field.name}
                      onChange={(e) => handleCustomFieldNameChange(field.id, e.target.value)}
                      placeholder={`Custom Field ${field.id} Name`}
                    />
                  </div>
                ))}
                <Button variant="outline" onClick={handleAddCustomField} className="mt-2">
                  Add Custom Field
                </Button>
              </div>

              {/* Simple Spreadsheet Diagram (conceptual) */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-md font-semibold mb-2">Spreadsheet Preview (Conceptual)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {csvHeaders.map((header, index) => (
                          <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#1a1d24] divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        {csvHeaders.map((header, index) => (
                          <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {columnMapping[header] ? CRM_FIELDS.find(f => f.key === columnMapping[header])?.label || columnMapping[header] : 'Custom Field'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleImportLeads} disabled={isLoading}>
            {isLoading ? 'Importing...' : 'Import Leads'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadImportModal;
