import type { Field, Fields, SubmitCallback, FormElement, InputType } from "./types/types";

class InputFactory {

    static create(fieldType: InputType): FormElement {

        switch (fieldType) {

            case "textarea":
                return document.createElement("textarea");

            case "select":
                return document.createElement("select");


            case "text":
            case "number":
            case "email":
            case "password":
            case "date":
            case "tel":
            case "url":
            case "radio":
                return document.createElement("input");

            case "checkbox":
                return document.createElement("div");

            default:
                throw new Error(`Type ${fieldType} inconnu`);
        }
    }

    private static checkCommonInputAttributes(el: HTMLInputElement, field: Field) {
        el.type = field.type ?? "text";

        if (field.min !== undefined) el.min = String(field.min);
        if (field.max !== undefined) el.max = String(field.max);
        if (field.pattern !== undefined) el.pattern = field.pattern;
    }


    private static bindAttributesInput(el: HTMLInputElement, field: Field) {

        this.checkCommonInputAttributes(el, field);
    }

    private static bindAttributesSelect(field: Field, el: HTMLSelectElement) {

        if (field.multiple !== undefined) el.multiple = field.multiple;

    }


    static applyAttributes(
        el: FormElement,
        name: string,
        field: Field
    ): void {

        el.id = name;

        this.checkAttributes(field);

        if (!(el instanceof HTMLDivElement)) {
            el.name = name;
            el.required = field.required ?? false;
        }

        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            el.placeholder = field.placeholder ?? field.label;
        }

        if (el instanceof HTMLInputElement) {
            this.bindAttributesInput(el, field);
        }

        if (el instanceof HTMLDivElement) {

            this.applyOptionsInputCheckbox(field, name, el);
        }



        if (el instanceof HTMLSelectElement) {
            this.applyOptionsSelect(el, field);
            this.bindAttributesSelect(field, el);
        }

    }

    private static checkAttributes(field: Field) {
        this.checkAttributesSelect(field);
        this.checkAttributesInputNumber(field);
    }

    private static checkAttributesSelect(field: Field) {
        if (field.type !== "select" && field.multiple !== undefined) {
            throw new Error("Multiple attribute only allowed for select");
        }
    }

    private static checkAttributesInputNumber(field: Field) {
        if (field.type !== "number" && (field.min !== undefined || field.max !== undefined)) {
            throw new Error("Min/max attribute only allowed for number");
        }
    }

    private static applyOptionsInputCheckbox(
        field: Field,
        name: string,
        container: HTMLDivElement
    ) {
        if (!field.options) return;

        field.options.forEach(opt => {
            const label = document.createElement("label");

            const input = document.createElement("input");
            input.type = "checkbox";
            input.name = name;
            input.value = opt;

            label.append(input, document.createTextNode(opt));

            container.appendChild(label);
        });
    }

    private static applyOptionsSelect(el: HTMLSelectElement, field: Field) {
        if (field.options) {
            field.options.forEach(opt => {
                const option = document.createElement("option");
                option.value = opt;
                option.textContent = opt;
                el.appendChild(option);
            });
        }
    }
}

class FieldRenderer {

    static render(name: string, field: Field): HTMLDivElement {

        const wrapper = document.createElement("div");
        wrapper.className = "form-group";

        const label = this.createLabel(name, field);
        const input = InputFactory.create(field.type);

        InputFactory.applyAttributes(input, name, field);

        wrapper.appendChild(label);
        wrapper.appendChild(input);

        return wrapper;
    }

    private static createLabel(name: string, field: Field): HTMLLabelElement {

        const label = document.createElement("label");
        label.htmlFor = name;
        label.textContent = field.label;

        return label;
    }
}


export class FormZen {

    private root: HTMLElement;
    private form: HTMLFormElement;

    constructor(
        selector: string,
        private fields: Fields,
        private callback: SubmitCallback
    ) {

        const root = document.querySelector(selector);

        if (!root) {
            throw new Error("Aucun élément trouvé : " + selector);
        }

        this.root = root as HTMLElement;

        this.form = this.createForm();

        this.renderFields();
        this.renderSubmitButton();
        this.bindSubmit();

        this.mount();
    }

    private createForm(): HTMLFormElement {
        const form = document.createElement("form");
        form.className = "formjs";
        return form;
    }

    private renderFields(): void {

        Object.entries(this.fields).forEach(([name, field]) => {
            const el = FieldRenderer.render(name, field);
            this.form.appendChild(el);
        });
    }

    private renderSubmitButton(): void {

        const button = document.createElement("button");
        button.type = "submit";
        button.textContent = "Envoyer";

        this.form.appendChild(button);
    }

    private bindSubmit(): void {

        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.callback(this.getFormData());
        });
    }

    private getFormData(): Record<string, string | string[]> {
        const data: Record<string, string | string[]> = {};
        const formData = new FormData(this.form);

        formData.forEach((value, key) => {
            const val = String(value);

            if (data[key] !== undefined) {
                const current = data[key];

                if (Array.isArray(current)) {
                    current.push(val);
                } else {
                    data[key] = [current, val];
                }
            } else {
                data[key] = val;
            }
        });

        return data;
    }

    private mount(): void {
        this.root.appendChild(this.form);
    }
}

export type { Field, Fields, SubmitCallback, FormElement, InputType } from "./types/types";