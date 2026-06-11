"use strict";
var FormZen = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    FormZen: () => FormZen
  });
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
    static checkCommonInputAttributes(el, field) {
      el.type = field.type ?? "text";
      if (field.min !== void 0) el.min = String(field.min);
      if (field.max !== void 0) el.max = String(field.max);
      if (field.pattern !== void 0) el.pattern = field.pattern;
    }
    static bindAttributesInput(el, field) {
      this.checkCommonInputAttributes(el, field);
    }
    static bindAttributesSelect(field, el) {
      if (field.multiple !== void 0) el.multiple = field.multiple;
    }
    static applyAttributes(el, name, field) {
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
    static checkAttributes(field) {
      this.checkAttributesSelect(field);
      this.checkAttributesInputNumber(field);
    }
    static checkAttributesSelect(field) {
      if (field.type !== "select" && field.multiple !== void 0) {
        throw new Error("Multiple attribute only allowed for select");
      }
    }
    static checkAttributesInputNumber(field) {
      if (field.type !== "number" && (field.min !== void 0 || field.max !== void 0)) {
        throw new Error("Min/max attribute only allowed for number");
      }
    }
    static applyOptionsInputCheckbox(field, name, container) {
      if (!field.options) return;
      field.options.forEach((opt) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = name;
        input.value = opt;
        label.append(input, document.createTextNode(opt));
        container.appendChild(label);
      });
    }
    static applyOptionsSelect(el, field) {
      if (field.options) {
        field.options.forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          el.appendChild(option);
        });
      }
    }
  };
  var FieldRenderer = class {
    static render(name, field) {
      const wrapper = document.createElement("div");
      wrapper.className = "form-group";
      const label = this.createLabel(name, field);
      const input = InputFactory.create(field.type);
      InputFactory.applyAttributes(input, name, field);
      wrapper.appendChild(label);
      wrapper.appendChild(input);
      return wrapper;
    }
    static createLabel(name, field) {
      const label = document.createElement("label");
      label.htmlFor = name;
      label.textContent = field.label;
      return label;
    }
  };
  var FormZen = class {
    constructor(selector, fields, callback) {
      this.fields = fields;
      this.callback = callback;
      const root = document.querySelector(selector);
      if (!root) {
        throw new Error("Aucun \xE9l\xE9ment trouv\xE9 : " + selector);
      }
      this.root = root;
      this.form = this.createForm();
      this.renderFields();
      this.renderSubmitButton();
      this.bindSubmit();
      this.mount();
    }
    createForm() {
      const form = document.createElement("form");
      form.className = "formjs";
      return form;
    }
    renderFields() {
      Object.entries(this.fields).forEach(([name, field]) => {
        const el = FieldRenderer.render(name, field);
        this.form.appendChild(el);
      });
    }
    renderSubmitButton() {
      const button = document.createElement("button");
      button.type = "submit";
      button.textContent = "Envoyer";
      this.form.appendChild(button);
    }
    bindSubmit() {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.callback(this.getFormData());
      });
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
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=index.global.js.map