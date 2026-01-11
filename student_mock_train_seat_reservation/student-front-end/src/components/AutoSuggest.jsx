/**
 * ============================================================================
 * AUTOSUGGEST COMPONENT
 * ============================================================================
 * 
 * A reusable component for station selection with:
 * - Real-time filtering
 * - Keyboard navigation (Arrows, Enter, Tab)
 * - Default first-item highlighting
 * - Automated focus transition
 */

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { FiMapPin } from 'react-icons/fi';

const AutoSuggest = forwardRef(function AutoSuggest({ 
  label, 
  placeholder, 
  data = [], 
  value, 
  onSelect, 
  icon: Icon = FiMapPin,
  iconColor = "text-blue-400",
  nextFieldRef
}, ref) {
  const [search, setSearch] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Expose the input's focus method to parent via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    blur: () => {
      inputRef.current?.blur();
    }
  }));

  // Sync search state if value prop changes
  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  // Filter data based on search
  const suggestions = Array.isArray(data) ? data.filter(item => 
    item.code?.toLowerCase().includes(search.toLowerCase()) || 
    item.station_name?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10) : [];

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    const displayValue = `${item.code} - ${item.station_name}`;
    setSearch(displayValue);
    onSelect(item.code, displayValue);
    setShowDropdown(false);
    
    // Auto-focus next field if ref is provided
    if (nextFieldRef?.current) {
      setTimeout(() => {
        // Check if it has a focus method (either native element or our exposed method)
        if (typeof nextFieldRef.current.focus === 'function') {
          nextFieldRef.current.focus();
        }
        // If it's a date input, try to open the picker
        if (nextFieldRef.current.type === 'date' && nextFieldRef.current.showPicker) {
          nextFieldRef.current.showPicker();
        }
      }, 10);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'ArrowDown') setShowDropdown(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
      case 'Tab':
        // Only prevent default if we're selecting something from the dropdown
        if (showDropdown && suggestions[highlightIndex]) {
          e.preventDefault();
          handleSelect(suggestions[highlightIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-sm text-gray-400 mb-2">{label}</label>}
      <div className="relative">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`} />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
            setHighlightIndex(0);
            if (e.target.value === '') {
              onSelect('', '');
            }
          }}
          onFocus={() => {
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input-field pl-12"
        />
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-xl max-h-60 overflow-y-auto shadow-2xl backdrop-blur-xl">
          {suggestions.map((item, idx) => (
            <button
              key={item.code}
              type="button"
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHighlightIndex(idx)}
              className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between border-b border-white/5 last:border-0 ${
                idx === highlightIndex ? 'bg-blue-600/30 text-white' : 'hover:bg-white/5 text-gray-300'
              }`}
            >
              <div>
                <span className={`font-bold ${idx === highlightIndex ? 'text-blue-300' : 'text-blue-400'}`}>
                  {item.code}
                </span>
                <span className="ml-2 text-sm opacity-80">- {item.station_name}</span>
              </div>
              {idx === highlightIndex && (
                <span className="text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300">
                  Press Enter
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default AutoSuggest;

