import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  disabled,
  placeholder = "YYYY-MM-DD",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate year range (Current Year +/- 50)
  const currentYearInt = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYearInt - 50 + i);

  // Sync internal view state when value changes or menu opens
  useEffect(() => {
    if (value && !isNaN(Date.parse(value))) {
      setViewDate(new Date(value));
    } else {
      setViewDate(new Date());
    }
  }, [value, isOpen]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setViewDate(new Date(newYear, viewDate.getMonth(), 1));
  };

  const handleDayClick = (day: number) => {
    // Construct date using local time to avoid timezone shifts
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    
    onChange(`${year}-${month}-${d}`);
    setIsOpen(false);
  };

  const handleTodayClick = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${d}`);
    setIsOpen(false);
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const days = [];
  // Empty slots for days before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
  }
  
  // Day buttons
  for (let d = 1; d <= daysInMonth; d++) {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isSelected = value === dateString;
    const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, d).toDateString();
    
    days.push(
      <button
        key={d}
        type="button"
        onClick={() => handleDayClick(d)}
        className={`h-8 w-8 text-xs rounded-full flex items-center justify-center transition-colors
          ${isSelected ? 'bg-brand-600 text-white hover:bg-brand-700' : ''}
          ${!isSelected && isToday ? 'text-brand-600 font-bold border border-brand-200 hover:bg-brand-50' : ''}
          ${!isSelected && !isToday ? 'text-gray-700 hover:bg-gray-100' : ''}
        `}
      >
        {d}
      </button>
    );
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative group">
         <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isOpen ? 'text-brand-500' : 'text-gray-400'}`}>
            <CalendarIcon className="w-4 h-4" />
         </div>
         <input
            type="text"
            readOnly
            disabled={disabled}
            value={value || ''}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onFocus={() => !disabled && setIsOpen(true)}
            placeholder={placeholder}
            className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm outline-none transition cursor-pointer
                ${isOpen ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-300 hover:border-gray-400'}
                ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900'}
            `}
         />
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-[60] w-64">
           {/* Header */}
           <div className="flex justify-between items-center mb-4 gap-2">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600 transition flex-shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1 overflow-hidden">
                <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                  {monthNames[currentMonth]}
                </span>
                <select 
                  value={currentYear}
                  onChange={handleYearChange}
                  className="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none cursor-pointer p-0 hover:text-brand-600 focus:ring-0 appearance-none text-right"
                  style={{ backgroundImage: 'none' }} // Ensure cross-browser clean look
                >
                   {years.map(y => (
                     <option key={y} value={y}>{y}</option>
                   ))}
                </select>
              </div>

              <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600 transition flex-shrink-0">
                <ChevronRight className="w-4 h-4" />
              </button>
           </div>
           
           {/* Weekday headers */}
           <div className="grid grid-cols-7 mb-2 text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-[10px] font-semibold text-gray-400 h-6 flex items-center justify-center uppercase tracking-wider">
                  {day}
                </div>
              ))}
           </div>

           {/* Days */}
           <div className="grid grid-cols-7 gap-y-1 justify-items-center mb-2">
              {days}
           </div>

           {/* Footer: Today Button */}
           <div className="pt-2 border-t border-gray-100">
              <button 
                onClick={handleTodayClick}
                className="w-full py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded transition flex items-center justify-center gap-1"
              >
                Today
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
