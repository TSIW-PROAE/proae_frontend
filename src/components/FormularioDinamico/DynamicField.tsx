import React from 'react';
import { Controller } from 'react-hook-form';
import { Input, Select, SelectItem, Radio, RadioGroup, Textarea, DatePicker } from '@heroui/react';
import FileUpload from '../FileUpload/FileUpload';
import { SelectOption, DynamicFieldProps } from '@/types/dynamicForm';
import SelectGroup from '../SelectGroup/SelectGroup';
import TextInputGroup from '../TextInputGroup/TextInputGroup';

export const DynamicField: React.FC<DynamicFieldProps> = ({
  input,
  form,
  formatValue
}) => {
  const {
    nome,
    tipo,
    obrigatorio,
    mimeType,
    titulo,
    subtitulo,
    options = []
  } = input;

  return (
    <Controller
      name={nome}
      control={form.control}
      render={({ field, fieldState }) => {
        const { error } = fieldState;

        switch (tipo) {
          case "text":
          case "number":
          case "password":
          case "email":
            return (
              <Input
                label={titulo}
                description={subtitulo}
                type={tipo === "number" ? "text" : tipo}
                value={String(field.value || "")}
                onChange={(e) => {
                  let value = e.target.value;
                  if (tipo === "number") {
                    value = value.replace(/\D/g, '');
                  }

                  const finalValue = formatValue ? formatValue(value) : value;
                  field.onChange(finalValue);
                }}
                errorMessage={error?.message}
                isRequired={obrigatorio}
                placeholder={input.placeholder}
              />
            );

          case "textarea":
            return (
              <Textarea
                label={titulo}
                description={subtitulo}
                value={String(field.value || "")}
                onChange={(e) => {
                  const value = formatValue ? formatValue(e.target.value) : e.target.value;
                  field.onChange(value);
                }}
                errorMessage={error?.message}
                isRequired={obrigatorio}
                placeholder={input.placeholder}
                maxLength={input.maxLength}
                minLength={input.minLength}
              />
            );

          case "select":
            return (
              <Select
                label={titulo}
                description={subtitulo}
                selectedKeys={field.value ? [String(field.value)] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  const finalValue = formatValue ? formatValue(selectedKey) : selectedKey;
                  field.onChange(finalValue);
                }}
                errorMessage={error?.message}
                isRequired={obrigatorio}
                placeholder={input.placeholder}
              >
                {options.map((option: SelectOption) => (
                  <SelectItem key={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            );

          case "radio":
            return (
              <RadioGroup
                label={titulo}
                description={subtitulo}
                value={String(field.value || "")}
                onValueChange={(value) => {
                  const finalValue = formatValue ? formatValue(value) : value;
                  field.onChange(finalValue);
                }}
                errorMessage={error?.message}
                isRequired={obrigatorio}
              >
                {options.map((option: SelectOption) => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </RadioGroup>
            );

          case "date":
            return (
              <DatePicker
                label={titulo}
                description={subtitulo}
                value={field.value as any}
                onChange={(value) => {
                  const finalValue = formatValue ? formatValue(value) : value;
                  field.onChange(finalValue);
                }}
                errorMessage={error?.message}
                isRequired={obrigatorio}
              />
            );

          case "file":
            return (
              <FileUpload
                title={titulo}
                accept={mimeType?.join(",")}
                onFileSelect={(file) => {
                  const finalValue = formatValue ? formatValue(file) : file;
                  field.onChange(finalValue);
                }}
              />
            );

          case "selectGroup":
            return(
              <SelectGroup
                title={titulo}
                questions={input.questions?.map((q) => ({ id: q, label: q })) || []}
                options={options as SelectOption[]}
                required={obrigatorio}
                error={error?.message}
                values={field.value as Record<string, string> || {}}
                onChange={(questionId, value) => {
                  const newValues = { ...(field.value || {}), [questionId]: value };
                  const finalValue = formatValue ? formatValue(newValues) : newValues;
                  field.onChange(finalValue);
                }}
              >
              </SelectGroup>
            )

          case "textInputGroup":
            return (
              <TextInputGroup
                options={input.options || []}
                questions={input.questions || []}
                title={titulo}
                description={subtitulo}
                required={obrigatorio}
                values={field.value as Record<string, Record<string, string>> || {}}
                onChange={(optionValue, questionName, value) => {
                  const currentValues = field.value as Record<string, Record<string, string>> || {};
                  const newValues = {
                    ...currentValues,
                    [optionValue]: {
                      ...(currentValues[optionValue] || {}),
                      [questionName]: value
                    }
                  };
                  const finalValue = formatValue ? formatValue(newValues) : newValues;
                  field.onChange(finalValue);
                }}
              />
            )

          default:
            return <div>Tipo de campo não suportado: {tipo}</div>;
        }
      }}
    />
  );
};
