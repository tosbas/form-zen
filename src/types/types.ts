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
    HTMLInputElement |
    HTMLTextAreaElement |
    HTMLSelectElement |
    HTMLDivElement

type Field = {
    type: InputType;
    label: string;
    required?: boolean;
    placeholder?: string;
    min?: string;
    max?: string;
    pattern?: string;
     options?: string[];
    multiple?:boolean; 
};

type Fields = Record<string, Field>;

type FormValue = string | string[];

type SubmitCallback = (
  data: Record<string, FormValue>
) => void;

export {Field, Fields,SubmitCallback, InputType, FormElement};