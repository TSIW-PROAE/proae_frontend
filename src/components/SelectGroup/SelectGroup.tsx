interface SelectGroupProps {
  title: string;
  options: { label: string; value: string }[];
  required?: boolean;
  error?: string;
  values?: Record<string, string>;
  onChange?: (optionValue: string, checked: boolean) => void;
}

export default function SelectGroup({
  title,
  options,
  required = false,
  error,
  values = {},
  onChange,
}: SelectGroupProps) {
  return (
    <div style={{ width: "100%", maxWidth: "56rem", fontFamily: "inherit" }}>
      {/* Título */}
      <p
        style={{
          fontSize: "0.875rem",
          fontWeight: 400,
          color: "#11181c",
          marginBottom: "8px",
        }}
      >
        {title}
        {required && (
          <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
        )}
      </p>

      {/* Blocos selecionáveis em grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "10px",
        }}
      >
        {options.map((opt) => {
          const isChecked = Boolean(values[opt.value]);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange?.(opt.value, !isChecked)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "14px 12px",
                borderRadius: "10px",
                border: isChecked
                  ? "2px solid #3b82f6"
                  : error
                    ? "2px solid #fca5a5"
                    : "1.5px solid #d1d5db",
                backgroundColor: isChecked ? "#3b82f6" : "#fff",
                cursor: "pointer",
                transition: "all 0.18s ease",
                userSelect: "none" as const,
                outline: "none",
                fontSize: "0.85rem",
                fontWeight: isChecked ? 600 : 500,
                color: isChecked ? "#fff" : "#374151",
                boxShadow: isChecked
                  ? "0 2px 8px rgba(59,130,246,0.35)"
                  : "0 1px 3px rgba(0,0,0,0.06)",
                minHeight: "48px",
              }}
            >
              {isChecked && (
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  style={{ marginRight: "6px", flexShrink: 0 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Erro */}
      {error && (
        <p
          style={{
            marginTop: "8px",
            fontSize: "0.75rem",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {required && !error && (
        <p style={{ marginTop: "4px", fontSize: "0.75rem", color: "#6b7280" }}>
          Selecione ao menos uma opção
        </p>
      )}
    </div>
  );
}
