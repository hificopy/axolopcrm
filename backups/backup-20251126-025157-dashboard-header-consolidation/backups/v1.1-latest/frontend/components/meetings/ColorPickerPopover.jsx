import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

/**
 * Color Picker Popover Component
 * Beautiful color picker with hex input and preset colors
 */
export default function ColorPickerPopover({ color, onChange, onClose, position = 'bottom' }) {
  const [tempColor, setTempColor] = useState(color);
  const popoverRef = useRef(null);

  // Preset colors for professional booking pages
  const presetColors = [
    '#0236C2', // Blue
    '#0099FF', // Light Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Green
    '#14B8A6', // Teal
    '#6B7280', // Gray
    '#1F2937', // Dark Gray
    '#000000', // Black
  ];

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleApply = () => {
    onChange(tempColor);
    onClose();
  };

  const handleHexInput = (e) => {
    let value = e.target.value;
    // Add # if not present
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(value) || value === '#') {
      setTempColor(value);
    }
  };

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-64"
      style={{
        top: position === 'bottom' ? 'calc(100% + 8px)' : 'auto',
        bottom: position === 'top' ? 'calc(100% + 8px)' : 'auto',
        left: 0,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Pick a color</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Color Picker */}
      <div className="mb-3">
        <HexColorPicker
          color={tempColor}
          onChange={setTempColor}
          style={{ width: '100%', height: '150px' }}
        />
      </div>

      {/* Hex Input */}
      <div className="mb-3">
        <label className="text-xs text-gray-600 mb-1 block">Hex Code</label>
        <Input
          value={tempColor}
          onChange={handleHexInput}
          className="font-mono text-sm"
          placeholder="#000000"
          maxLength={7}
        />
      </div>

      {/* Preset Colors */}
      <div className="mb-3">
        <label className="text-xs text-gray-600 mb-2 block">Preset Colors</label>
        <div className="grid grid-cols-6 gap-2">
          {presetColors.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              onClick={() => setTempColor(presetColor)}
              className={`w-full h-8 rounded border-2 transition-all hover:scale-110 ${
                tempColor.toUpperCase() === presetColor.toUpperCase()
                  ? 'border-gray-800 ring-2 ring-offset-1 ring-gray-400'
                  : 'border-gray-200'
              }`}
              style={{ backgroundColor: presetColor }}
              title={presetColor}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  );
}
