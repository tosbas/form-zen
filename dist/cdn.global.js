"use strict";
var FormZenCDN = (() => {
  // src/index.ts
  var InputFactory = class {
    static create(fieldType) {
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
    static apply(el, name, field) {
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
        if (field.min !== void 0) el.min = String(field.min);
        if (field.max !== void 0) el.max = String(field.max);
        if (field.pattern !== void 0) el.pattern = field.pattern;
      }
      if (el instanceof HTMLSelectElement) {
        if (field.multiple !== void 0) el.multiple = field.multiple;
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
    static applyCheckbox(container, name, field) {
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
  };
  var FieldRenderer = class {
    static render(name, field) {
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
  };
  var FormZen = class {
    constructor(selector, fields = {}, submitCallback, submitLabel = "Submit") {
      this.callback = null;
      const root = document.querySelector(selector);
      if (!root) {
        throw new Error("Aucun \xE9l\xE9ment trouv\xE9 : " + selector);
      }
      this.root = root;
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
    addFields(fields) {
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
    removeFields(names) {
      names.forEach((name) => {
        if (!this.fields[name]) return;
        delete this.fields[name];
        const el = this.form.querySelector(`#form-zen-${name}`);
        const lab = this.form.querySelector(`label[for="${name}"]`);
        el?.remove();
        lab?.remove();
      });
    }
    addButtonSubmit(label, type = "submit") {
      const existing = this.getSubmitButton();
      if (existing) {
        existing.remove();
      }
      const button = document.createElement("button");
      button.type = type;
      button.textContent = label;
      this.form.appendChild(button);
    }
    addCallback(cb) {
      this.callback = cb;
    }
    /* =========================
       INTERNALS
    ========================= */
    createForm() {
      const form = document.createElement("form");
      form.className = "form-zen";
      return form;
    }
    renderFields() {
      Object.entries(this.fields).forEach(([name, field]) => {
        const el = FieldRenderer.render(name, field);
        this.form.appendChild(el);
      });
    }
    bindSubmit() {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (this.callback) {
          this.callback(this.getFormData());
        }
      });
    }
    getSubmitButton() {
      return this.form.querySelector('button[type="submit"]');
    }
    getFormData() {
      const data = {};
      const formData = new FormData(this.form);
      formData.forEach((value, key) => {
        const val = String(value);
        if (data[key] !== void 0) {
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
    mount() {
      this.root.appendChild(this.form);
    }
  };

  // src/cdn.ts
  window.FormZen = FormZen;
})();
