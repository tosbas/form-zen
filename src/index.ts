import type {
  Field,
  Fields,
  SubmitCallback,
  FormElement,
  InputType,
} from "./types/types";

/* =========================
   INPUT FACTORY
========================= */
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

  static apply(el: FormElement, name: string, field: Field) {
    const isWrapper = el instanceof HTMLDivElement;

    if (!isWrapper) {
      el.id = "form-zen-" + name;
      el.name = name;
      el.required = field.required ?? false;
    }

    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.placeholder = field.placeholder ?? field.label;
    }

    if (el instanceof HTMLInputElement) {
      el.type = field.type ?? "text";

      if (field.min !== undefined) el.min = String(field.min);
      if (field.max !== undefined) el.max = String(field.max);
      if (field.pattern !== undefined) el.pattern = field.pattern;
    }

    if (el instanceof HTMLSelectElement) {
      if (field.multiple !== undefined) el.multiple = field.multiple;

      if (field.options) {
        field.options.forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          el.appendChild(option);
        });
      }
    }

    if (el instanceof HTMLDivElement) {
      this.applyCheckbox(el, name, field);
    }
  }

  private static applyCheckbox(
    container: HTMLDivElement,
    name: string,
    field: Field,
  ) {
    if (!field.options) return;

    field.options.forEach((opt) => {
      const label = document.createElement("label");

      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = name;
      input.value = opt;

      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));

      container.appendChild(label);
    });
  }
}

/* =========================
   FIELD RENDERER
========================= */
class FieldRenderer {
  static render(name: string, field: Field): HTMLDivElement {
    const wrapper = document.createElement("div");
    wrapper.className = "form-group";
    wrapper.id = `field-${name}`;

    const label = document.createElement("label");
    label.htmlFor = name;
    label.textContent = field.label;

    const input = InputFactory.create(field.type);

    InputFactory.apply(input, name, field);

    wrapper.appendChild(label);
    wrapper.appendChild(input);

    return wrapper;
  }
}

/* =========================
   FORM ZEN
========================= */
export class FormZen {
  private root: HTMLElement;
  private form: HTMLFormElement;
  private fields: Fields;
  private callback: SubmitCallback | null = null;

  constructor(
    selector: string,
    fields: Fields = {},
    submitCallback?: SubmitCallback,
    submitLabel: string = "Submit",
  ) {
    const root = document.querySelector(selector);

    if (!root) {
      throw new Error("Aucun élément trouvé : " + selector);
    }

    this.root = root as HTMLElement;
    this.fields = fields;

    this.form = this.createForm();

    this.renderFields();
    this.addButtonSubmit(submitLabel);
    this.bindSubmit();
    this.mount();
  }

  /* =========================
     PUBLIC API
  ========================= */

  addFields(fields: Fields): void {
    Object.entries(fields).forEach(([name, field]) => {
      if (this.fields[name]) {
        throw new Error(`Field "${name}" already exists`);
      }

      this.fields[name] = field;

      const el = FieldRenderer.render(name, field);
      const submitBtn = this.getSubmitButton();

      this.form.insertBefore(el, submitBtn);
    });
  }

  removeFields(names: string[]): void {
    names.forEach((name) => {
      if (!this.fields[name]) return;

      delete this.fields[name];

      const el = this.form.querySelector(`#form-zen-${name}`);
      const lab = this.form.querySelector(`label[for="${name}"]`);
      el?.remove();
      lab?.remove();
    });
  }

  addButtonSubmit(
    label: string,
    type: "submit" | "button" | "reset" = "submit",
  ): void {
    const existing = this.getSubmitButton();

    if (existing) {
      existing.remove();
    }

    const button = document.createElement("button");
    button.type = type;
    button.textContent = label;

    this.form.appendChild(button);
  }

  addCallback(cb: SubmitCallback): void {
    this.callback = cb;
  }

  /* =========================
     INTERNALS
  ========================= */

  private createForm(): HTMLFormElement {
    const form = document.createElement("form");
    form.className = "form-zen";
    return form;
  }

  private renderFields(): void {
    Object.entries(this.fields).forEach(([name, field]) => {
      const el = FieldRenderer.render(name, field);
      this.form.appendChild(el);
    });
  }

  private bindSubmit(): void {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.callback) {
        this.callback(this.getFormData());
      }
    });
  }

  private getSubmitButton(): HTMLButtonElement | null {
    return this.form.querySelector('button[type="submit"]');
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
export type {
  Field,
  Fields,
  SubmitCallback,
  FormElement,
  InputType,
} from "./types/types";
