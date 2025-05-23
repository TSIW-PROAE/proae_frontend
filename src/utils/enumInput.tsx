export enum TypeInput {
    Text = "text",
    Number = "number",
    Textarea = "textarea",
    Radio = "radio",
    Select = "select",
    File = "file",
    Email = "email",
    Calendar = "calendar",
    TextWithPlusButton = "textWithPlusButton",
    TextWithCalendar = "textWithCalendar",
    TextWithCalendarRange = "textWithCalendarRange",
}

export enum TypeFormat {
    Phone = "phone",            // (00) 00000-0000
    Cpf = "cpf",                // 000.000.000-00
    Cep = "cep",                // 00000-000
    Cnpj = "cnpj",              // 00.000.000/0000-00
    Rg = "rg",                  // 00.000.000-0
    Moeda = "moeda",            // R$ 0.000,00
}
