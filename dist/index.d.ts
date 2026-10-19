type InputType = "text" | "password" | "textarea" | "select" | "email" | "number" | "date" | "tel" | "url" | "checkbox" | "radio";
type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLDivElement;
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
type Field = (FieldOptions & {
    type: "select";
    options: string[];
    multiple?: boolean;
}) | (FieldOptions & {
    type: "checkbox" | "radio";
    options: string[];
    multiple?: never;
}) | (FieldOptions & {
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

declare class FormZen {
    private static nextInstanceId;
    private static readonly hostFormOwners;
    private root;
    private form;
    private fields;
    private callback;
    private readonly instanceId;
    private readonly ownsForm;
    private readonly submitHandler;
    constructor(selector: string, fields?: Fields, submitCallback?: SubmitCallback, submitButton?: SubmitButtonOptions | string);
    addFields(fields: Fields): void;
    removeFields(names: string[]): void;
    addButtonSubmit(label?: string): void;
    addCallback(cb: SubmitCallback): void;
    destroy(): void;
    private assertField;
    private validateFields;
    private cloneField;
    private getSubmitLabel;
    private createForm;
    private renderFields;
    private bindSubmit;
    private updateRequiredCheckboxValidity;
    emitSubmit(): void;
    private getSubmitButton;
    private getFormData;
    private mount;
}

export { type Field, type Fields, type FormElement, FormZen, type InputType, type SubmitButtonOptions, type SubmitCallback };
