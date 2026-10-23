import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { FormZen } from "../dist/index.js";

before(() => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");

  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.HTMLInputElement = dom.window.HTMLInputElement;
  global.HTMLSelectElement = dom.window.HTMLSelectElement;
  global.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
  global.HTMLButtonElement = dom.window.HTMLButtonElement;
  global.HTMLFormElement = dom.window.HTMLFormElement;
  global.HTMLDivElement = dom.window.HTMLDivElement;
});

let nextRootId = 0;

function createForm(fields = {}, callback, targetTag = "div") {
  const root = document.createElement(targetTag);
  root.id = `form-zen-test-${nextRootId++}`;
  document.body.appendChild(root);

  const formZen = new FormZen(`#${root.id}`, fields, callback);
  const form = targetTag === "form" ? root : root.querySelector("form");

  return { root, form, formZen };
}

describe("FormZen", () => {
  it("reports a missing mount selector in English", () => {
    assert.throws(() => new FormZen("#missing"), {
      message: "No element found for selector: #missing",
    });
  });

  it("renders fields and invokes the submit callback", () => {
    let received;
    const { root, form } = createForm(
      { name: { label: "Name", type: "text" } },
      (data) => {
        received = data;
      },
    );

    form.elements.namedItem("name").value = "Ada";
    form.dispatchEvent(
      new window.Event("submit", { bubbles: true, cancelable: true }),
    );

    assert.deepEqual(received, { name: "Ada" });
    root.remove();
  });

  it("renders directly into an existing form", () => {
    const { root, form } = createForm(
      { email: { label: "Email", type: "email" } },
      undefined,
      "form",
    );

    assert.equal(root.querySelector("form"), null);
    assert.equal(form.classList.contains("form-zen"), true);
    assert.ok(form.elements.namedItem("email"));
    root.remove();
  });

  it("keeps the action button a submit button and allows changing its label", () => {
    const root = document.createElement("div");
    root.id = `form-zen-test-${nextRootId++}`;
    document.body.appendChild(root);

    const formZen = new FormZen(`#${root.id}`, {}, undefined, "Continue");
    let button = root.querySelector("button");
    assert.equal(button.textContent, "Continue");
    assert.equal(button.type, "submit");

    formZen.addButtonSubmit("Send");
    button = root.querySelector("button");
    assert.equal(root.querySelectorAll("button").length, 1);
    assert.equal(button.textContent, "Send");
    assert.equal(button.type, "submit");
    root.remove();
  });

  it("accepts button options and defaults the label", () => {
    const first = document.createElement("div");
    first.id = `form-zen-test-${nextRootId++}`;
    document.body.appendChild(first);
    const second = createForm({}, undefined);

    new FormZen(`#${first.id}`, {}, undefined, { label: "Continue" });
    assert.equal(first.querySelector("button").textContent, "Continue");
    assert.equal(second.root.querySelector("button").textContent, "Submit");

    first.remove();
    second.root.remove();
  });

  it("returns every selected value from a multiple select", () => {
    const { root, formZen, form } = createForm({
      colors: {
        label: "Colors",
        type: "select",
        options: ["Red", "Green", "Blue"],
        multiple: true,
      },
    });
    const select = form.elements.namedItem("colors");
    select.options[1].selected = true;
    select.options[2].selected = true;

    let received;
    formZen.addCallback((data) => {
      received = data;
    });
    formZen.emitSubmit();
    assert.deepEqual(received, { colors: ["Green", "Blue"] });

    select.options[1].selected = false;
    select.options[2].selected = false;
    formZen.emitSubmit();
    assert.deepEqual(received, { colors: [] });
    root.remove();
  });

  it("returns a string from a single select", () => {
    const { root, formZen, form } = createForm({
      country: {
        label: "Country",
        type: "select",
        options: ["France", "Canada"],
      },
    });
    form.elements.namedItem("country").value = "Canada";

    let received;
    formZen.addCallback((data) => {
      received = data;
    });
    formZen.emitSubmit();

    assert.deepEqual(received, { country: "Canada" });
    root.remove();
  });

  it("returns checkbox values as an array, including an empty array", () => {
    const { root, formZen, form } = createForm({
      interests: {
        label: "Interests",
        type: "checkbox",
        options: ["Music", "Sports", "Books"],
      },
    });
    const checkboxes = form.querySelectorAll('[name="interests"]');
    let received;
    formZen.addCallback((data) => {
      received = data;
    });

    formZen.emitSubmit();
    assert.deepEqual(received, { interests: [] });
    checkboxes[0].checked = true;
    formZen.emitSubmit();
    assert.deepEqual(received, { interests: ["Music"] });
    checkboxes[2].checked = true;
    formZen.emitSubmit();
    assert.deepEqual(received, { interests: ["Music", "Books"] });
    root.remove();
  });

  it("returns the selected radio option and an empty string when none is selected", () => {
    const { root, formZen, form } = createForm({
      plan: {
        label: "Plan",
        type: "radio",
        options: ["Free", "Pro"],
      },
    });
    const radios = form.querySelectorAll('[name="plan"]');
    let received;
    formZen.addCallback((data) => {
      received = data;
    });

    formZen.emitSubmit();
    assert.deepEqual(received, { plan: "" });
    radios[1].checked = true;
    formZen.emitSubmit();
    assert.deepEqual(received, { plan: "Pro" });
    assert.equal(form.querySelector("fieldset legend").textContent, "Plan");
    root.remove();
  });

  it("requires one checkbox in a required checkbox group", () => {
    let calls = 0;
    const { root, form, formZen } = createForm(
      {
        terms: {
          label: "Accept terms",
          type: "checkbox",
          required: true,
          options: ["I agree"],
        },
      },
      () => {
        calls++;
      },
    );

    form.dispatchEvent(
      new window.Event("submit", { bubbles: true, cancelable: true }),
    );
    assert.equal(calls, 0);

    const checkbox = form.querySelector('[name="terms"]');
    checkbox.checked = true;
    form.dispatchEvent(
      new window.Event("submit", { bubbles: true, cancelable: true }),
    );
    assert.equal(calls, 1);

    formZen.destroy();
    root.remove();
  });

  it("enforces required radio groups using native validation", () => {
    let calls = 0;
    const { root, form } = createForm(
      {
        plan: {
          label: "Plan",
          type: "radio",
          required: true,
          options: ["Free", "Pro"],
        },
      },
      () => {
        calls++;
      },
    );

    form.dispatchEvent(
      new window.Event("submit", { bubbles: true, cancelable: true }),
    );
    assert.equal(calls, 0);
    form.querySelector('[value="Free"]').checked = true;
    form.dispatchEvent(
      new window.Event("submit", { bubbles: true, cancelable: true }),
    );
    assert.equal(calls, 1);
    root.remove();
  });

  it("requires an explicit choice in a required single select", () => {
    let calls = 0;
    const { root, form } = createForm(
      {
        country: {
          label: "Country",
          type: "select",
          required: true,
          options: ["France", "Canada"],
        },
      },
      () => {
        calls++;
      },
    );

    assert.equal(form.elements.namedItem("country").value, "");
    form.dispatchEvent(
      new window.Event("submit", { bubbles: true, cancelable: true }),
    );
    assert.equal(calls, 0);

    form.elements.namedItem("country").value = "Canada";
    form.dispatchEvent(
      new window.Event("submit", { bubbles: true, cancelable: true }),
    );
    assert.equal(calls, 1);
    root.remove();
  });

  it("validates and adds fields without partially applying invalid input", () => {
    const { root, formZen, form } = createForm({
      name: { label: "Name", type: "text" },
    });

    assert.throws(
      () =>
        formZen.addFields({
          email: { label: "Email", type: "email" },
          invalid: { label: "Bad", type: "unknown" },
        }),
      /unsupported type/,
    );
    assert.equal(form.querySelector('[name="email"]'), null);
    assert.throws(
      () => formZen.addFields({ name: { label: "Duplicate", type: "text" } }),
      /already exists/,
    );
    formZen.addFields({
      email: { label: "Email", type: "email" },
    });
    assert.ok(form.querySelector('[name="email"]'));
    root.remove();
  });

  it("removes complete field groups without relying on selector-safe names", () => {
    const { root, formZen, form } = createForm({
      "person.name": { label: "Name", type: "text" },
      other: { label: "Other", type: "text" },
    });

    formZen.removeFields(["person.name"]);
    assert.equal(form.querySelector('[name="person.name"]'), null);
    assert.equal(form.querySelectorAll("[data-form-zen-field]").length, 1);
    assert.ok(form.querySelector('[name="other"]'));
    root.remove();
  });

  it("handles special object keys safely", () => {
    const fields = Object.fromEntries([
      ["__proto__", { label: "Prototype", type: "text" }],
    ]);
    const { root, formZen, form } = createForm(fields);
    const input = form.querySelector('input[name="__proto__"]');
    input.value = "safe";

    let received;
    formZen.addCallback((data) => {
      received = data;
    });
    formZen.emitSubmit();

    assert.equal(Object.hasOwn(received, "__proto__"), true);
    assert.equal(received["__proto__"], "safe");
    root.remove();
  });

  it("applies browser constraints and accessibility attributes", () => {
    const { root, form } = createForm({
      age: {
        label: "Age",
        type: "number",
        min: "18",
        max: "99",
        step: 1,
        required: true,
      },
      nickname: {
        label: "Nickname",
        type: "text",
        minLength: 2,
        maxLength: 20,
        autocomplete: "nickname",
        readOnly: true,
        disabled: true,
      },
    });

    const age = form.elements.namedItem("age");
    const nickname = form.elements.namedItem("nickname");
    assert.equal(age.min, "18");
    assert.equal(age.max, "99");
    assert.equal(age.step, "1");
    assert.equal(age.required, true);
    assert.equal(nickname.minLength, 2);
    assert.equal(nickname.maxLength, 20);
    assert.equal(nickname.autocomplete, "nickname");
    assert.equal(nickname.readOnly, true);
    assert.equal(nickname.disabled, true);
    assert.equal(nickname.placeholder, "Nickname");
    root.remove();
  });

  it("does not include disabled values in submitted data", () => {
    const { root, formZen } = createForm({
      disabled: { label: "Disabled", type: "text", disabled: true },
      enabled: { label: "Enabled", type: "text" },
      choices: {
        label: "Choices",
        type: "checkbox",
        disabled: true,
        options: ["A"],
      },
    });

    let received;
    formZen.addCallback((data) => {
      received = data;
    });
    formZen.emitSubmit();

    assert.deepEqual(received, { enabled: "" });
    root.remove();
  });

  it("rejects malformed field schemas before rendering", () => {
    const root = document.createElement("div");
    root.id = `form-zen-test-${nextRootId++}`;
    document.body.appendChild(root);

    assert.throws(
      () =>
        new FormZen(`#${root.id}`, {
          choices: { label: "Choices", type: "checkbox" },
        }),
      /options must be an array/,
    );
    assert.throws(
      () =>
        new FormZen(`#${root.id}`, {
          choices: {
            label: "Choices",
            type: "checkbox",
            options: ["A", "A"],
          },
        }),
      /must not contain duplicates/,
    );
    assert.throws(
      () =>
        new FormZen(`#${root.id}`, {
          name: { label: "", type: "text" },
        }),
      /non-empty string/,
    );
    assert.throws(
      () =>
        new FormZen(`#${root.id}`, {
          age: { label: "Age", type: "number", min: "30", max: "18" },
        }),
      /min cannot exceed max/,
    );
    assert.throws(
      () =>
        new FormZen(`#${root.id}`, {
          age: { label: "Age", type: "number", min: "0x10" },
        }),
      /valid numbers/,
    );
    assert.throws(
      () =>
        new FormZen(`#${root.id}`, {
          start: { label: "Start", type: "date", min: "2026-02-30" },
        }),
      /valid ISO dates/,
    );
    assert.equal(root.childElementCount, 0);
    root.remove();
  });

  it("destroys generated forms and preserves an existing host form", () => {
    const containerForm = createForm(
      { name: { label: "Name", type: "text" } },
      undefined,
      "form",
    );
    containerForm.formZen.destroy();
    assert.equal(containerForm.form.querySelector('[name="name"]'), null);
    assert.equal(containerForm.form.querySelector("button"), null);
    assert.equal(containerForm.root.isConnected, true);
    containerForm.root.remove();

    const generated = createForm({ name: { label: "Name", type: "text" } });
    const generatedForm = generated.form;
    generated.formZen.destroy();
    assert.equal(generatedForm.isConnected, false);
    generated.root.remove();
  });

  it("isolates multiple instances mounted into the same form", () => {
    const root = document.createElement("form");
    root.id = `form-zen-test-${nextRootId++}`;
    document.body.appendChild(root);

    const first = new FormZen(`#${root.id}`, {
      first: { label: "First", type: "text" },
    });
    const second = new FormZen(`#${root.id}`, {
      second: { label: "Second", type: "text" },
    });

    first.destroy();
    assert.equal(root.querySelector('[name="first"]'), null);
    assert.ok(root.querySelector('[name="second"]'));
    assert.equal(root.querySelectorAll("[data-form-zen-submit]").length, 1);
    assert.equal(root.classList.contains("form-zen"), true);

    second.destroy();
    assert.equal(root.querySelector('[name="second"]'), null);
    assert.equal(root.classList.contains("form-zen"), false);
    root.remove();
  });
});
