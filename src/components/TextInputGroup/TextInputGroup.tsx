import { Input } from "@heroui/react";
import { useState } from "react";

type Option = {
  label: string;
  value: string;
}


export interface TextInputGroupProps {
  title: string;
  description?: string;
  required?: boolean;
  questions: string[];
  options: Option[];
  values?: Record<string, Record<string, string>>;
  onChange?: (optionValue: string, questionIndex: number, value: string) => void;
}

export default function TextInputGroup({
  options,
  title,
  description,
  required,
  questions,
  values = {},
  onChange
}: TextInputGroupProps) {
  const [inputValues, setInputValues] = useState<Record<string, Record<string, string>>>(values);

  const handleInputChange = (optionValue: string, questionIndex: number, value: string) => {
    const newValues = {
      ...inputValues,
      [optionValue]: {
        ...inputValues[optionValue],
        [`question_${questionIndex}`]: value
      }
    };
    setInputValues(newValues);
    onChange?.(optionValue, questionIndex, value);
  };

  const getInputValue = (optionValue: string, questionIndex: number): string => {
    return inputValues[optionValue]?.[`question_${questionIndex}`] || '';
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-4">
        <h3 className="text-base font-medium text-gray-800 sm:text-lg">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>

      {/* Versão Desktop/Tablet */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="min-w-full">
          {/* Cabeçalho com as questions */}
          <div
            className="grid gap-1 mb-3"
            style={{ gridTemplateColumns: `minmax(200px, 1fr) repeat(${questions.length}, minmax(150px, 500px))` }}
          >
            {/* Célula vazia para alinhamento */}
            <div></div>

            {/* Headers das questions */}
            {questions.map((question, index) => (
              <div
                key={index}
                className="text-center px-2 py-2 bg-blue-50 border border-blue-200 rounded"
              >
                <span className="text-xs font-medium text-blue-800 block break-words leading-tight">
                  {question}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className="grid gap-1 items-center py-2 border-b border-gray-100 last:border-b-0"
                style={{ gridTemplateColumns: `minmax(200px, 1fr) repeat(${questions.length}, minmax(150px, 500px))` }}
              >
                <div className="pr-2">
                  <label className="text-sm font-medium text-gray-700 leading-tight">
                    {option.label}
                  </label>
                </div>

                {questions.map((question, questionIndex) => (
                  <div key={`${optionIndex}-${questionIndex}`} className="px-1">
                    <Input
                      size="sm"
                      placeholder="Digite..."
                      value={getInputValue(option.value, questionIndex)}
                      onChange={(e) => handleInputChange(option.value, questionIndex, e.target.value)}
                      classNames={{
                        input: "text-xs",
                        inputWrapper: "min-h-unit-8 h-8"
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="block sm:hidden space-y-3">
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="bg-gray-50 p-3 rounded-lg">
            <div className="mb-2">
              <label className="text-sm font-medium text-gray-700 block">
                {question}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>

            <div className="space-y-3">
              {options.map((option, optionIndex) => (
                <div key={`mobile-${questionIndex}-${optionIndex}`}>
                  <Input
                    label={option.label}
                    size="sm"
                    placeholder="Digite sua resposta..."
                    value={getInputValue(option.value, questionIndex)}
                    onChange={(e) => handleInputChange(option.value, questionIndex, e.target.value)}
                    classNames={{
                      label: "text-xs font-medium text-blue-700",
                      input: "text-sm"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
