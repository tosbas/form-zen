[![npm version](https://img.shields.io/npm/v/%40tosbas%2Fform-zen)](https://www.npmjs.com/package/@tosbas/form-zen)
[![npm downloads](https://img.shields.io/npm/d18m/%40tosbas%2Fform-zen)](https://www.npmjs.com/package/@tosbas/form-zen)
[![npm license](https://img.shields.io/npm/l/%40tosbas%2Fform-zen)](https://www.npmjs.com/package/@tosbas/form-zen)

# FormZen

FormZen is a lightweight TypeScript library for generating dynamic browser forms from a simple schema object.

It is dependency-free, easy to use, and designed for modern frontend applications.

---

## ✨ Features

- Generate forms from a declarative schema
- Support for text, email, password, number, date, tel, url, textarea, select, checkbox and radio inputs
- Accessible labels and grouped checkbox/radio controls
- Native browser validation with required, min/max, length, pattern and step constraints
- Clean submit callback with string or array values
- TypeScript support

---

## 📦 Installation

```bash
npm install @tosbas/form-zen
```

---

## 🚀 Quick start

```ts
import { FormZen } from "@tosbas/form-zen";

const form = new FormZen(
  "#app",
  {
    username: {
      type: "text",
      label: "Username",
      required: true,
      placeholder: "Enter your username",
    },
    email: {
      type: "email",
      label: "Email",
      required: true,
    },
    hobbies: {
      type: "checkbox",
      label: "Hobbies",
      options: ["Sport", "Music", "Coding"],
    },
  },
  (data) => {
    console.log("Submitted data:", data);
  }
);
```

The submit button is always a native `submit` button, so browser validation and
form submission work as expected. You can optionally customize its label with
the fourth constructor argument:

```ts
new FormZen(
  "#app",
  { name: { type: "text", label: "Name" } },
  (data) => console.log(data),
  { label: "Continue" },
);
```

You can also pass the label directly as a string:

```ts
new FormZen(
  "#app",
  { name: { type: "text", label: "Name" } },
  (data) => console.log(data),
  "Continue",
);
```

The label defaults to `"Submit"`.

Pass a selector for a container to have FormZen create a form inside it. If the
selector targets an existing `<form>`, FormZen renders directly into that form.

---

## 🧩 Field types

### 📝 textarea

```ts
type: "textarea"
```

**Return value:** `string`

---

### 📋 select

```ts
type: "select",
options: ["Option 1", "Option 2"]
```

**Behavior:**
- Uses `options` as dropdown values
- Supports `multiple: true`

```ts
type: "select",
options: ["A", "B"],
multiple: true
```

**Return value:**
- `string` → single select
- `string[]` → multiple select

---

### ☑️ checkbox

```ts
type: "checkbox",
options: ["A", "B", "C"]
```

**Behavior:**
- Rendered as a group of checkboxes
- Each option is independent

**Return value:**
- `string[]` → checked values
- `[]` → if nothing is selected

---

### 🔘 radio

```ts
type: "radio",
options: ["Male", "Female"]
```

**Behavior:**
- Single selection group

**Return value:** `string` (empty when no option is selected)

---

## 🌐 CDN Usage

These unversioned jsDelivr URLs resolve to the latest version published on npm.
After publishing a release, they will serve that release automatically (subject
to CDN cache propagation). For reproducible deployments, you can pin a version;
for example, use `@2.0.0` after that version has been published.

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@tosbas/form-zen/dist/form-zen.min.css"
/>

<script src="https://cdn.jsdelivr.net/npm/@tosbas/form-zen/dist/cdn.global.min.js"></script>

<script>
  const form = new FormZen(
    "#app",
    {
      name: { type: "text", label: "Name", required: true },
      email: { type: "email", label: "Email", required: true },
    },
    (data) => {
      console.log(data);
    }
  );
</script>
```

To pin this release instead, add `@2.0.0` after `form-zen` in both CDN URLs.

---

## 📦 Supported field types

- text
- password
- email
- number
- date
- tel
- url
- textarea
- select
- checkbox
- radio

---

## ⚠️ Notes

- Checkbox fields always return arrays of selected values
- Empty checkbox groups and multiple selects return empty arrays
- Radio fields return the selected value or an empty string
- Select returns `string` or `string[]` depending on `multiple`
- Disabled fields are omitted from callback data, like native form submission
- Each field key becomes the HTML `name` attribute
- Unknown field properties and invalid configurations throw descriptive errors

## 🛠️ Managing fields

Fields can be added or removed after creating the form. Invalid additions are
rejected before any fields are changed:

```ts
form.addFields({
  phone: { type: "tel", label: "Phone", autocomplete: "tel" },
});

form.removeFields(["phone"]);
```

Call `destroy()` when the form is no longer needed. It removes a generated form,
or removes only FormZen-managed fields and its submit button from an existing
`<form>`.

---

## 🧪 Development

```bash
npm install
npm run build
npm test
```

---

## 📄 License

MIT

## Contributors

- Tosbas
