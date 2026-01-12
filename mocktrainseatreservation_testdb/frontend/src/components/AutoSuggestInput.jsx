/**
 * AutoSuggestInput Component
 * A professional reusable autosuggestion input with keyboard navigation,
 * first-item highlighting, full station display, and auto-focus to next control.
 * 
 * Props:
 * - value: Current input value
 * - onChange: Function called when input value changes
 * - onSelect: Function called when an item is selected (receives the selected item)
 * - items: Array of items to filter and display
 * - filterFn: Optional custom filter function (receives item, searchValue) => boolean
 * - displayFn: Function to get display text from item (receives item) => { primary, secondary }
 * - valueFn: Function to get value from item (receives item) => string
 * - fullDisplayFn: Optional function for full display after selection (receives item) => string
 * - placeholder: Input placeholder text
 * - label: Input label text
 * - nextRef: Ref to next input element to focus on selection
 * - maxItems: Max number of items to display (default: 5)
 * - className: Additional className for the container
 * - inputRef: Optional external ref for the input element
 */

import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

const AutoSuggestInput = forwardRef(({
    value,
    onChange,
    onSelect,
    items = [],
    filterFn,
    displayFn = (item) => ({ primary: item, secondary: '' }),
    valueFn = (item) => item,
    fullDisplayFn = null, // Optional: show full name after selection
    placeholder = '',
    label = '',
    nextRef = null,
    maxItems = 5,
    className = '',
    id = '',
    autoFocus = false
}, ref) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredItems, setFilteredItems] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [displayValue, setDisplayValue] = useState(''); // For showing full station name
    const [isSelecting, setIsSelecting] = useState(false); // Track if selection is in progress
    const internalInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const containerRef = useRef(null);

    // Expose focus method to parent via ref
    useImperativeHandle(ref, () => ({
        focus: () => {
            internalInputRef.current?.focus();
        },
        blur: () => {
            internalInputRef.current?.blur();
        }
    }));

    // Default filter function - searches by primary and secondary display values
    const defaultFilterFn = useCallback((item, searchValue) => {
        const display = displayFn(item);
        const search = searchValue.toUpperCase();
        return (
            display.primary.toUpperCase().includes(search) ||
            display.secondary.toUpperCase().includes(search)
        );
    }, [displayFn]);

    // Filter items when value changes
    useEffect(() => {
        // Don't filter if we just selected an item (displayValue is set)
        if (displayValue) {
            setShowDropdown(false);
            return;
        }
        
        if (value && value.length > 0) {
            const filter = filterFn || defaultFilterFn;
            const filtered = items
                .filter(item => filter(item, value))
                .slice(0, maxItems);
            setFilteredItems(filtered);
            setShowDropdown(filtered.length > 0);
            setHighlightedIndex(0); // Always highlight first item
        } else {
            setShowDropdown(false);
            setFilteredItems([]);
        }
    }, [value, items, filterFn, defaultFilterFn, maxItems, displayValue]);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!showDropdown || filteredItems.length === 0) {
            // Tab to next field even if dropdown is not open
            if (e.key === 'Tab' && nextRef?.current) {
                // Allow default tab behavior
                return;
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev < filteredItems.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Tab':
            case 'Enter':
                e.preventDefault();
                if (filteredItems[highlightedIndex]) {
                    selectItem(filteredItems[highlightedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                break;
            default:
                break;
        }
    };

    // Select an item
    const selectItem = (item) => {
        setIsSelecting(true); // Mark that we're in selection process
        
        const selectedValue = valueFn(item);
        const display = displayFn(item);
        
        // Set display value to show full station name
        const fullDisplay = fullDisplayFn 
            ? fullDisplayFn(item) 
            : `${display.primary} - ${display.secondary}`;
        setDisplayValue(fullDisplay);
        
        // Immediately hide dropdown
        setShowDropdown(false);
        setFilteredItems([]);
        
        onChange({ target: { value: selectedValue } });
        if (onSelect) {
            onSelect(item);
        }
        
        // Focus next input after a small delay to ensure state updates
        setTimeout(() => {
            setIsSelecting(false); // Reset selection flag
            
            if (nextRef?.current) {
                // Check if it's a ref with focus method (AutoSuggestInput) or native element
                if (typeof nextRef.current.focus === 'function') {
                    nextRef.current.focus();
                }
                // If it's a date input, try to open the picker
                if (nextRef.current.type === 'date') {
                    try {
                        nextRef.current.showPicker?.();
                    } catch (e) {
                        // showPicker might not be supported in all browsers
                    }
                }
            }
        }, 50);
    };

    // Handle input focus - clear display value to allow typing
    const handleFocus = () => {
        if (displayValue && !isSelecting) {
            setDisplayValue('');
        }
    };

    // Handle input blur - close dropdown
    const handleBlur = (e) => {
        // Check if the related target (where focus is going) is within our container
        // If so, don't close the dropdown (user might be clicking on a suggestion)
        if (containerRef.current?.contains(e.relatedTarget)) {
            return;
        }
        
        // Delay to allow click events on dropdown items
        setTimeout(() => {
            if (!isSelecting) {
                setShowDropdown(false);
                // If there's a value but no display value, find the matching item
                if (value && !displayValue) {
                    const matchedItem = items.find(item => valueFn(item) === value);
                    if (matchedItem) {
                        const display = displayFn(matchedItem);
                        const fullDisplay = fullDisplayFn 
                            ? fullDisplayFn(matchedItem) 
                            : `${display.primary} - ${display.secondary}`;
                        setDisplayValue(fullDisplay);
                    }
                }
            }
        }, 150);
    };

    // Handle input change
    const handleInputChange = (e) => {
        const newValue = e.target.value.toUpperCase();
        setDisplayValue(''); // Clear full display when typing
        onChange({ target: { value: newValue } });
    };

    // Scroll highlighted item into view
    useEffect(() => {
        if (showDropdown && dropdownRef.current) {
            const highlightedElement = dropdownRef.current.children[highlightedIndex];
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, showDropdown]);

    // Initialize display value if value is already set
    useEffect(() => {
        if (value && items.length > 0 && !displayValue && !isSelecting) {
            const matchedItem = items.find(item => valueFn(item) === value);
            if (matchedItem) {
                const display = displayFn(matchedItem);
                const fullDisplay = fullDisplayFn 
                    ? fullDisplayFn(matchedItem) 
                    : `${display.primary} - ${display.secondary}`;
                setDisplayValue(fullDisplay);
            }
        }
    }, [value, items, displayFn, valueFn, fullDisplayFn, displayValue, isSelecting]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <input
                ref={internalInputRef}
                type="text"
                id={id}
                className="input"
                placeholder={placeholder}
                value={displayValue || value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoFocus={autoFocus}
                autoComplete="off"
            />
            {showDropdown && filteredItems.length > 0 && (
                <div 
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
                    style={{ minWidth: '280px' }}
                >
                    {filteredItems.map((item, index) => {
                        const display = displayFn(item);
                        return (
                            <div
                                key={valueFn(item)}
                                className={`px-4 py-3 cursor-pointer transition-all duration-150 ${
                                    index === highlightedIndex
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                                        : 'hover:bg-slate-700/80'
                                }`}
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent blur before click
                                    selectItem(item);
                                }}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className={`font-bold text-lg ${
                                            index === highlightedIndex ? 'text-white' : 'text-blue-400'
                                        }`}>
                                            {display.primary}
                                        </span>
                                        {display.secondary && (
                                            <span className={`ml-3 ${
                                                index === highlightedIndex ? 'text-blue-100' : 'text-slate-400'
                                            }`}>
                                                {display.secondary}
                                            </span>
                                        )}
                                    </div>
                                    {index === highlightedIndex && (
                                        <span className="text-xs text-blue-200 opacity-75">
                                            ↵ Enter
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700 text-xs text-slate-500">
                        ↑↓ Navigate • Tab/Enter to select
                    </div>
                </div>
            )}
        </div>
    );
});

AutoSuggestInput.displayName = 'AutoSuggestInput';

export default AutoSuggestInput;
