import { useState, useRef, useEffect } from "react";
export default function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value);
  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div ref={selectRef} className="w-full h-full max-w-sm font-inter">
      {label && (
        <label className="block mb-1 text-sm text-[#52525B]">
          {label}
        </label>
      )}
      <div className="relative">
        <div 
          className={`relative w-full rounded-lg ${disabled ? "opacity-50" : ""}`}
          style={{ 
            border: '2px solid #A1A1AA'
          }}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            className={`bg-transparent w-full px-4 py-2 text-base text-[#A1A1AA] text-left 
              rounded-lg focus:outline-none appearance-none
              flex justify-between items-center
              ${disabled ? "cursor-not-allowed" : "hover:opacity-80"}
            `}
            style={{ 
              backgroundColor: 'transparent',
              boxShadow: 'none',
            }}
          >
            <span className={`text-base ${selectedOption ? "text-[#2F2F30]" : "text-[#A1A1AA]"}`}>
              {selectedOption?.label || placeholder}
            </span>
            {/* Clean outlined down/up V chevron */}
            <span
              className={`ml-2 w-2 h-2 border-l-2 border-b-2 border-[#525252] transform transition-transform duration-200 ${
                isOpen ? "rotate-135" : "-rotate-45"
              }`}
            ></span>
          </button>
        </div>
        {/* Dropdown with smooth animation */}
        <div
          className={`absolute z-10 mt-1 w-full transform origin-top transition-all duration-200 ease-out ${
            isOpen
              ? "opacity-100 scale-y-100"
              : "opacity-0 scale-y-95 pointer-events-none"
          }`}
        >
          <ul
            className="bg-transparent border-2 border-[#A1A1AA] rounded-lg max-h-60 overflow-y-auto"
            role="listbox"
          >
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                  option.value === value ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}







