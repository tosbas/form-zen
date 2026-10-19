type InputType =
  | "text"
  | "password"
  | "textarea"
  | "select"
  | "email"
  | "number"
  | "date"
  | "tel"
  | "url"
  | "checkbox"
  | "radio";

type FormElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | HTMLDivElement;

type FieldOptions = {
  label: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
  minLength?: number;
  maxLength?: number;
  step?: number | "any";
  pattern?: string;
  autocomplete?: string;
  disabled?: boolean;
  readOnly?: boolean;
};

type Field =
  | (FieldOptions & {
      type: "select";
      options: string[];
      multiple?: boolean;
    })
  | (FieldOptions & {
      type: "checkbox" | "radio";
      options: string[];
      multiple?: never;
    })
  | (FieldOptions & {
      type: Exclude<InputType, "select" | "checkbox" | "radio">;
      options?: never;
      multiple?: never;
    });

type Fields = Record<string, Field>;

type FormValue = string | string[];

type SubmitCallback = (data: Record<string, FormValue>) => void;

type SubmitButtonOptions = {
  label?: string;
};

export {
  Field,
  Fields,
  SubmitCallback,
  SubmitButtonOptions,
  InputType,
  FormElement,
};
