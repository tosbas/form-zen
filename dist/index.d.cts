type InputType = "text" | "password" | "textarea" | "select" | "email" | "number" | "date" | "tel" | "url" | "checkbox" | "radio";
type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLDivElement;
type Field = {
    type: InputType;
    label: string;
    required?: boolean;
    placeholder?: string;
    min?: string;
    max?: string;
    pattern?: string;
    options?: string[];
    multiple?: boolean;
};
type Fields = Record<string, Field>;
type FormValue = string | string[];
type SubmitCallback = (data: Record<string, FormValue>) => void;

declare class FormZen {
    private fields;
    private callback;
    private root;
    private form;
    constructor(selector: string, fields: Fields, callback: SubmitCallback);
    private createForm;
    private renderFields;
    private renderSubmitButton;
    private bindSubmit;
    private getFormData;
    private mount;
}

export { type Field, type Fields, type FormElement, FormZen, type InputType, type SubmitCallback };
