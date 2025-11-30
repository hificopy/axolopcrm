import { useState } from 'react';
import { Search, Download, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Explorer() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Explorer</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="default">
              <Filter className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
            <Button
              variant="outline"
              size="default"
              className="bg-[#7b1c14] hover:bg-[#6b1a12] text-white border-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search across all data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Card className="bg-white">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-[#7b1c14]" />
              Data Explorer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="h-12 w-12 text-gray-300" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-[#7b1c14] flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start exploring your data</h3>
              <p className="text-gray-600 max-w-md mb-6">
                Use the explorer to search, filter, and analyze your CRM data. Create custom views and export reports.
              </p>
              <Button
                variant="default"
                size="default"
                className="bg-[#7b1c14] hover:bg-[#6b1a12]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom View
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
