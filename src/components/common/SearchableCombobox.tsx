'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  [key: string]: any;
}

interface SearchableComboboxProps {
  options: Option[];
  value: string; // the ID or name depending on usage
  onChange: (value: string, isNewEntry?: boolean, newName?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  valueField?: 'id' | 'name';
  displayField?: 'name';
}

export function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  valueField = 'id',
  displayField = 'name'
}: SearchableComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find the selected option's display text
  const selectedOption = options.find(opt => opt[valueField] === value);
  const displayValue = selectedOption ? selectedOption[displayField] : value;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = searchQuery.length >= 2 
    ? options.filter(opt => opt[displayField].toLowerCase().includes(searchQuery.toLowerCase()))
    : options; // Show all by default or maybe limit to 50 if too many? We'll show all if searchQuery is empty for standard select feel.

  const exactMatch = options.find(opt => opt[displayField].toLowerCase() === searchQuery.toLowerCase());

  const handleSelect = (opt: Option) => {
    onChange(opt[valueField], false);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCreateNew = () => {
    if (searchQuery.trim()) {
      onChange(searchQuery.trim(), true, searchQuery.trim());
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        className={`w-full bg-white border border-gray-300 rounded-md px-3 py-2 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500 ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'text-gray-900'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`block truncate text-sm ${!displayValue ? 'text-gray-400' : 'text-gray-900'}`}>
          {displayValue || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-8 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>

          <div className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id || opt.name}
                  className="px-3 py-2 text-sm text-gray-900 cursor-pointer hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleSelect(opt)}
                >
                  {opt[displayField]}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 italic">
                No matching results.
              </div>
            )}
            
            {searchQuery.length >= 3 && !exactMatch && (
              <div 
                className="px-3 py-2 text-sm cursor-pointer border-t border-gray-100 text-red-600 hover:bg-red-50 flex items-center gap-2"
                onClick={handleCreateNew}
              >
                <Plus className="w-4 h-4" />
                Add "{searchQuery}" as new entry
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
