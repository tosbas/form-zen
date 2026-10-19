"use strict";
var FormZenCDN = (() => {
  // src/index.ts
  var InputFactory = class {
    static create(name, field, instanceId) {
      const id = `form-zen-${instanceId}-${encodeURIComponent(name)}`;
      if (field.type === "checkbox" || field.type === "radio") {
        const group = document.createElement("div");
        group.className = "form-zen-options";
        const inputs = [];
        field.options.forEach((option, index) => {
          const label = document.createElement("label");
          const input = document.createElement("input");
          input.type = field.type;
          input.id = `${id}-${index}`;
          input.name = name;
          input.value = option;
          input.disabled = field.disabled ?? false;
          input.required = field.type === "radio" && (field.required ?? false);
          label.htmlFor = input.id;
          label.append(input, document.createTextNode(option));
          group.appendChild(label);
          inputs.push(input);
        });
        if (field.type === "checkbox" && field.required && inputs[0]) {
          const updateValidity = () => {
            inputs[0].setCustomValidity(
              inputs.some((input) => input.checked) ? "" : `${field.label} is required.`
            );
          };
          inputs.forEach(
            (input) => input.addEventListener("change", updateValidity)
          );
          updateValidity();
        }
        return group;
      }
      const element = field.type === "textarea" ? document.createElement("textarea") : field.type === "select" ? document.createElement("select") : document.createElement("input");
      element.id = id;
      element.name = name;
      element.required = field.required ?? false;
      element.disabled = field.disabled ?? false;
      if (element instanceof HTMLInputElement) {
        element.type = field.type;
        if (field.min !== void 0) element.min = field.min;
        if (field.max !== void 0) element.max = field.max;
        if (field.minLength !== void 0) element.minLength = field.minLength;
        if (field.maxLength !== void 0) element.maxLength = field.maxLength;
        if (field.step !== void 0) element.step = String(field.step);
        if (field.pattern !== void 0) element.pattern = field.pattern;
        if (field.autocomplete !== void 0)
          element.setAttribute("autocomplete", field.autocomplete);
        if (field.readOnly !== void 0) element.readOnly = field.readOnly;
      } else if (element instanceof HTMLTextAreaElement) {
        if (field.minLength !== void 0) element.minLength = field.minLength;
        if (field.maxLength !== void 0) element.maxLength = field.maxLength;
        if (field.autocomplete !== void 0)
          element.setAttribute("autocomplete", field.autocomplete);
        if (field.readOnly !== void 0) element.readOnly = field.readOnly;
      } else {
        element.multiple = field.multiple ?? false;
        if (field.required && !element.multiple && field.options[0] !== "") {
          const placeholder = document.createElement("option");
          placeholder.value = "";
          placeholder.textContent = field.placeholder ?? "Select an option";
          placeholder.disabled = true;
          placeholder.selected = true;
          element.appendChild(placeholder);
        }
        field.options.forEach((option) => {
          const optionElement = document.createElement("option");
          optionElement.value = option;
          optionElement.textContent = option;
          element.appendChild(optionElement);
        });
      }
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.placeholder = field.placeholder ?? field.label;
      }
      return element;
    }
  };
  var FieldRenderer = class {
    static render(name, field, instanceId) {
      const wrapper = document.createElement("div");
      wrapper.className = "form-zen-group";
      wrapper.dataset.formZenField = name;
      const input = InputFactory.create(name, field, instanceId);
      if (field.type === "checkbox" || field.type === "radio") {
        const fieldset = document.createElement("fieldset");
        const legend = document.createElement("legend");
        legend.textContent = field.label;
        fieldset.append(legend, input);
        wrapper.appendChild(fieldset);
      } else {
        const label = document.createElement("label");
        label.htmlFor = input.id;
        label.textContent = field.label;
        wrapper.append(label, input);
      }
      return wrapper;
    }
  };
  var _FormZen = class _FormZen {
    constructor(selector, fields = {}, submitCallback, submitButton = {}) {
      this.fields = /* @__PURE__ */ new Map();
      this.callback = null;
      this.instanceId = String(_FormZen.nextInstanceId++);
      this.submitHandler = (event) => {
        event.preventDefault();
        this.updateRequiredCheckboxValidity();
        if (!this.form.checkValidity()) {
          this.form.reportValidity();
          return;
        }
        this.callback?.(this.getFormData());
      };
      const root = document.querySelector(selector);
      if (!root) {
        throw new Error("Aucun \xE9l\xE9ment trouv\xE9 : " + selector);
      }
      const submitLabel = this.getSubmitLabel(submitButton);
      if (submitCallback !== void 0 && typeof submitCallback !== "function") {
        throw new Error("Submit callback must be a function");
      }
      this.root = root;
      this.callback = submitCallback ?? null;
      this.validateFields(fields);
      Object.entries(fields).forEach(
        ([name, field]) => this.fields.set(name, this.cloneField(field))
      );
      this.ownsForm = !(root instanceof HTMLFormElement);
      this.form = root instanceof HTMLFormElement ? root : this.createForm();
      if (!this.ownsForm) {
        let owners = _FormZen.hostFormOwners.get(this.form);
        if (!owners) {
          owners = {
            hadFormZenClass: this.form.classList.contains("form-zen"),
            instances: /* @__PURE__ */ new Set()
          };
          _FormZen.hostFormOwners.set(this.form, owners);
        }
        owners.instances.add(this.instanceId);
      }
      this.form.classList.add("form-zen");
      this.renderFields();
      this.addButtonSubmit(submitLabel);
      this.bindSubmit();
      this.mount();
    }
    /* =========================
       PUBLIC API
    ========================= */
    addFields(fields) {
      this.validateFields(fields);
      const entries = Object.entries(fields);
      entries.forEach(([name]) => {
        if (this.fields.has(name)) {
          throw new Error(`Field "${name}" already exists`);
        }
      });
      const rendered = entries.map(([name, field]) => {
        const config = this.cloneField(field);
        return {
          name,
          field: config,
          element: FieldRenderer.render(name, config, this.instanceId)
        };
      });
      rendered.forEach(({ name, field, element }) => {
        this.fields.set(name, field);
        element.dataset.formZenInstance = this.instanceId;
        const submitBtn = this.getSubmitButton();
        this.form.insertBefore(element, submitBtn);
      });
    }
    removeFields(names) {
      if (!Array.isArray(names) || names.some((name) => typeof name !== "string")) {
        throw new Error("Field names must be an array of strings");
      }
      names.forEach((name) => {
        if (!this.fields.delete(name)) return;
        this.form.querySelectorAll("[data-form-zen-field]").forEach((field) => {
          if (field.dataset.formZenInstance === this.instanceId && field.dataset.formZenField === name) {
            field.remove();
          }
        });
      });
    }
    addButtonSubmit(label = "Submit") {
      if (typeof label !== "string" || label.trim() === "") {
        throw new Error("Submit button label must be a non-empty string");
      }
      const existing = this.getSubmitButton();
      if (existing) {
        existing.remove();
      }
      const button = document.createElement("button");
      button.type = "submit";
      button.textContent = label;
      button.dataset.formZenSubmit = "";
      button.dataset.formZenInstance = this.instanceId;
      this.form.appendChild(button);
    }
    addCallback(cb) {
      if (typeof cb !== "function") {
        throw new Error("Submit callback must be a function");
      }
      this.callback = cb;
    }
    destroy() {
      this.form.removeEventListener("submit", this.submitHandler);
      if (this.ownsForm) {
        this.form.remove();
        return;
      }
      this.form.querySelectorAll("[data-form-zen-field], [data-form-zen-submit]").forEach((element) => {
        if (element.dataset.formZenInstance === this.instanceId) {
          element.remove();
        }
      });
      const owners = _FormZen.hostFormOwners.get(this.form);
      owners?.instances.delete(this.instanceId);
      if (owners && owners.instances.size === 0) {
        if (!owners.hadFormZenClass) this.form.classList.remove("form-zen");
        _FormZen.hostFormOwners.delete(this.form);
      }
    }
    /* =========================
       INTERNALS
    ========================= */
    assertField(field, name) {
      if (!field || typeof field !== "object" || Array.isArray(field)) {
        throw new Error(`Field "${name}" invalide`);
      }
      const value = field;
      const allowed = /* @__PURE__ */ new Set([
        "type",
        "label",
        "required",
        "placeholder",
        "min",
        "max",
        "minLength",
        "maxLength",
        "step",
        "pattern",
        "autocomplete",
        "disabled",
        "readOnly",
        "options",
        "multiple"
      ]);
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) {
          throw new Error(`Field "${name}" unknown key: ${key}`);
        }
      }
      const types = [
        "text",
        "password",
        "textarea",
        "select",
        "email",
        "number",
        "date",
        "tel",
        "url",
        "checkbox",
        "radio"
      ];
      if (typeof value.type !== "string" || !types.includes(value.type)) {
        throw new Error(`Field "${name}" has an unsupported type`);
      }
      if (typeof value.label !== "string" || value.label.trim() === "") {
        throw new Error(`Field "${name}" label must be a non-empty string`);
      }
      for (const key of ["required", "disabled", "readOnly", "multiple"]) {
        if (value[key] !== void 0 && typeof value[key] !== "boolean") {
          throw new Error(`Field "${name}" ${key} must be boolean`);
        }
      }
      for (const key of ["placeholder", "min", "max", "pattern", "autocomplete"]) {
        if (value[key] !== void 0 && typeof value[key] !== "string") {
          throw new Error(`Field "${name}" ${key} must be a string`);
        }
      }
      for (const key of ["minLength", "maxLength"]) {
        if (value[key] !== void 0 && (typeof value[key] !== "number" || !Number.isFinite(value[key]))) {
          throw new Error(`Field "${name}" ${key} must be a finite number`);
        }
      }
      if (value.step !== void 0 && value.step !== "any" && (typeof value.step !== "number" || !Number.isFinite(value.step))) {
        throw new Error(`Field "${name}" step must be a finite number or "any"`);
      }
      const hasOptions = ["select", "checkbox", "radio"].includes(value.type);
      if (hasOptions && !Array.isArray(value.options)) {
        throw new Error(`Field "${name}" options must be an array`);
      }
      if (!hasOptions && value.options !== void 0) {
        throw new Error(`Field "${name}" options are only supported for select, checkbox, and radio`);
      }
      if (value.options !== void 0) {
        if (!Array.isArray(value.options) || value.options.some((option) => typeof option !== "string")) {
          throw new Error(`Field "${name}" options must be an array of strings`);
        }
        if (new Set(value.options).size !== value.options.length) {
          throw new Error(`Field "${name}" options must not contain duplicates`);
        }
        if (value.options.length === 0) {
          throw new Error(`Field "${name}" must have at least one option`);
        }
      }
      if (value.multiple !== void 0 && value.type !== "select") {
        throw new Error(`Field "${name}" multiple is only supported for select`);
      }
      if ((value.min !== void 0 || value.max !== void 0 || value.step !== void 0) && value.type !== "number" && value.type !== "date") {
        throw new Error(`Field "${name}" min, max, and step require a number or date field`);
      }
      if (value.type === "number") {
        const min = value.min;
        const max = value.max;
        const isNumber = (bound) => bound === void 0 || bound === "" || /^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(bound) && Number.isFinite(Number(bound));
        if (!isNumber(min) || !isNumber(max)) {
          throw new Error(`Field "${name}" min and max must be valid numbers`);
        }
        if (min && max && Number(min) > Number(max)) {
          throw new Error(`Field "${name}" min cannot exceed max`);
        }
      }
      if (value.type === "date") {
        const min = value.min;
        const max = value.max;
        const isValidDate = (date) => {
          if (date === void 0 || date === "") return true;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
          const parsed = /* @__PURE__ */ new Date(`${date}T00:00:00.000Z`);
          return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
        };
        if (!isValidDate(min) || !isValidDate(max)) {
          throw new Error(`Field "${name}" min and max must be valid ISO dates`);
        }
        if (min && max && min > max) {
          throw new Error(`Field "${name}" min cannot exceed max`);
        }
      }
      if ((value.minLength !== void 0 || value.maxLength !== void 0) && !["text", "password", "email", "tel", "url", "textarea"].includes(
        value.type
      )) {
        throw new Error(`Field "${name}" minLength and maxLength require a text field`);
      }
      if (value.pattern !== void 0 && !["text", "password", "email", "tel", "url"].includes(
        value.type
      )) {
        throw new Error(`Field "${name}" pattern requires a supported text input`);
      }
      if (value.readOnly === true && ["checkbox", "radio", "select"].includes(value.type)) {
        throw new Error(`Field "${name}" does not support readOnly`);
      }
      if (typeof value.minLength === "number" && (!Number.isInteger(value.minLength) || value.minLength < 0) || typeof value.maxLength === "number" && (!Number.isInteger(value.maxLength) || value.maxLength < 0)) {
        throw new Error(`Field "${name}" minLength and maxLength must be non-negative integers`);
      }
      if (typeof value.minLength === "number" && typeof value.maxLength === "number" && value.minLength > value.maxLength) {
        throw new Error(`Field "${name}" minLength cannot exceed maxLength`);
      }
      if (typeof value.step === "number" && value.step <= 0) {
        throw new Error(`Field "${name}" step must be greater than zero`);
      }
    }
    validateFields(fields) {
      if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
        throw new Error("Fields must be an object");
      }
      Object.entries(fields).forEach(([name, field]) => {
        this.assertField(field, name);
      });
    }
    cloneField(field) {
      if (field.type === "select" || field.type === "checkbox" || field.type === "radio") {
        return { ...field, options: [...field.options] };
      }
      return { ...field };
    }
    getSubmitLabel(submitButton) {
      if (typeof submitButton === "string") {
        if (submitButton.trim() === "") return "Submit";
        return submitButton;
      }
      if (!submitButton || typeof submitButton !== "object" || Array.isArray(submitButton)) {
        throw new Error("Submit button options must be an object or a string");
      }
      const options = submitButton;
      if (Object.keys(options).some((key) => key !== "label")) {
        throw new Error("Submit button options only support the label property");
      }
      if (options.label !== void 0 && (typeof options.label !== "string" || options.label.trim() === "")) {
        throw new Error("Submit button label must be a non-empty string");
      }
      return options.label ?? "Submit";
    }
    createForm() {
      const form = document.createElement("form");
      form.className = "form-zen";
      return form;
    }
    renderFields() {
      this.fields.forEach((field, name) => {
        const el = FieldRenderer.render(name, field, this.instanceId);
        el.dataset.formZenInstance = this.instanceId;
        this.form.insertBefore(el, this.getSubmitButton());
      });
    }
    bindSubmit() {
      this.form.addEventListener("submit", this.submitHandler);
    }
    updateRequiredCheckboxValidity() {
      const wrappers = /* @__PURE__ */ new Map();
      this.form.querySelectorAll("[data-form-zen-field]").forEach((element) => {
        if (element.dataset.formZenInstance === this.instanceId) {
          const name = element.dataset.formZenField;
          if (name !== void 0) wrappers.set(name, element);
        }
      });
      this.fields.forEach((field, name) => {
        if (field.type !== "checkbox" || !field.required) return;
        const wrapper = wrappers.get(name);
        const checkboxes = wrapper?.querySelectorAll('input[type="checkbox"]');
        if (!checkboxes?.length) return;
        checkboxes[0].setCustomValidity(
          Array.from(checkboxes).some((checkbox) => checkbox.checked) ? "" : `${field.label} is required.`
        );
      });
    }
    emitSubmit() {
      const data = this.getFormData();
      if (this.callback) {
        this.callback(data);
      }
    }
    getSubmitButton() {
      return Array.from(
        this.form.querySelectorAll("[data-form-zen-submit]")
      ).find((button) => button.dataset.formZenInstance === this.instanceId) ?? null;
    }
    getFormData() {
      const entries = [];
      const wrappers = /* @__PURE__ */ new Map();
      this.form.querySelectorAll("[data-form-zen-field]").forEach((element) => {
        const name = element.dataset.formZenField;
        if (name !== void 0 && element.dataset.formZenInstance === this.instanceId) {
          wrappers.set(name, element);
        }
      });
      this.fields.forEach((field, name) => {
        if (field.disabled) {
          return;
        }
        const wrapper = wrappers.get(name);
        if (!wrapper) return;
        const controls = Array.from(
          wrapper.querySelectorAll(
            "input, select, textarea"
          )
        );
        if (field.type === "checkbox") {
          entries.push([
            name,
            controls.filter(
              (control) => control instanceof HTMLInputElement && control.type === "checkbox" && control.checked
            ).map((control) => control.value)
          ]);
        } else if (field.type === "radio") {
          const selected = controls.find(
            (control) => control instanceof HTMLInputElement && control.type === "radio" && control.checked
          );
          entries.push([name, selected?.value ?? ""]);
        } else {
          const control = controls.find(
            (candidate) => candidate instanceof HTMLSelectElement || candidate instanceof HTMLInputElement || candidate instanceof HTMLTextAreaElement
          );
          if (!control) return;
          entries.push([
            name,
            control instanceof HTMLSelectElement && control.multiple ? Array.from(control.selectedOptions, (option) => option.value) : control.value
          ]);
        }
      });
      return Object.fromEntries(entries);
    }
    mount() {
      if (this.ownsForm) this.root.appendChild(this.form);
    }
  };
  _FormZen.nextInstanceId = 0;
  _FormZen.hostFormOwners = /* @__PURE__ */ new WeakMap();
  var FormZen = _FormZen;

  // src/cdn.ts
  window.FormZen = FormZen;
})();
