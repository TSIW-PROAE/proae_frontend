import { useState } from "react";

type RadioOption = {
  label: string;
  value: string;
}

type RadioQuestion = {
  id: string;
  label: string;
}

interface SelectGroupProps {
  title: string;
  questions: RadioQuestion[];
  options: RadioOption[];
  required?: boolean;
  error?: string;
  values?: Record<string, string>;
  onChange?: (questionId: string, value: string) => void;
}

export default function SelectGroup({
  title,
  questions,
  options,
  required = false,
  error,
  values = {},
  onChange
}: SelectGroupProps) {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(values);

  const handleChange = (questionId: string, value: string) => {
    const newValues = { ...selectedValues, [questionId]: value };
    setSelectedValues(newValues);
    onChange?.(questionId, value);
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-4">
        <h3 className="text-base font-medium text-gray-800 sm:text-lg">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h3>
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <div className="min-w-full">
          <div
            className="grid gap-1 mb-3"
            style={{ gridTemplateColumns: `minmax(200px, 1fr) repeat(${options.length}, minmax(60px, 500px))` }}
          >
            <div></div>

            {options.map((option) => (
              <div
                key={option.value}
                className="text-center px-2 py-2 bg-blue-50 border border-blue-200 rounded"
              >
                <span className="text-xs font-medium text-blue-800 block break-words leading-tight">
                  {option.label}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {questions.map((question) => (
              <div
                key={question.id}
                className="grid gap-1 items-center py-2 border-b border-gray-100 last:border-b-0"
                style={{ gridTemplateColumns: `minmax(200px, 1fr) repeat(${options.length}, minmax(60px, 500px))` }}
              >
                <div className="pr-1">
                  <label className="text-sm font-medium text-gray-700 leading-tight">
                    {question.label}
                  </label>
                </div>

                {options.map((option) => (
                  <div key={`${question.id}-${option.value}`} className="flex justify-center">
                    <div className="relative">
                      <input
                        type="radio"
                        id={`${question.id}-${option.value}`}
                        name={question.id}
                        value={option.value}
                        checked={selectedValues[question.id] === option.value}
                        onChange={() => handleChange(question.id, option.value)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`${question.id}-${option.value}`}
                        className={`
                          w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center
                          transition-all duration-150 hover:scale-105 hover:shadow-sm
                          ${selectedValues[question.id] === option.value
                            ? 'bg-blue-500 border-blue-500 shadow-sm'
                            : error
                            ? 'border-red-300 hover:border-red-400 bg-white'
                            : 'border-blue-300 hover:border-blue-400 bg-white'
                          }
                        `}
                      >
                        {selectedValues[question.id] === option.value && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Versão Mobile - Layout Vertical */}
      <div className="block sm:hidden space-y-3">
        {questions.map((question) => (
          <div key={question.id} className="bg-gray-50 p-3 rounded-lg">
            <div className="mb-2">
              <label className="text-sm font-medium text-gray-700 block">
                {question.label}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {options.map((option) => (
                <div key={`${question.id}-${option.value}`} className="flex items-center">
                  <input
                    type="radio"
                    id={`mobile-${question.id}-${option.value}`}
                    name={question.id}
                    value={option.value}
                    checked={selectedValues[question.id] === option.value}
                    onChange={() => handleChange(question.id, option.value)}
                    className="sr-only"
                  />
                  <label
                    htmlFor={`mobile-${question.id}-${option.value}`}
                    className={`
                      flex items-center w-full p-2 rounded border cursor-pointer transition-colors
                      ${selectedValues[question.id] === option.value
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                      }
                    `}
                  >
                    <div className={`
                      w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center flex-shrink-0
                      ${selectedValues[question.id] === option.value
                        ? 'border-white'
                        : 'border-gray-400'
                      }
                    `}>
                      {selectedValues[question.id] === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs font-medium truncate">
                      {option.label}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-3">
          <p className="text-xs text-red-600 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        </div>
      )}

      {required && !error && (
        <div className="mt-1">
          <p className="text-xs text-gray-500">
            Campos obrigatórios
          </p>
        </div>
      )}
    </div>
  );
}
