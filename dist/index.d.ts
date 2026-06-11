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
    private root;
    private form;
    private fields;
    private callback;
    constructor(selector: string, fields?: Fields, submitCallback?: SubmitCallback, submitLabel?: string);
    addFields(fields: Fields): void;
    removeFields(names: string[]): void;
    addButtonSubmit(label: string, type?: "submit" | "button" | "reset"): void;
    addCallback(cb: SubmitCallback): void;
    private createForm;
    private renderFields;
    private bindSubmit;
    private getSubmitButton;
    private getFormData;
    private mount;
}

export { type Field, type Fields, type FormElement, FormZen, type InputType, type SubmitCallback };
