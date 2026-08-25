[![npm version](https://img.shields.io/npm/v/%40tosbas%2Fform-zen)](https://www.npmjs.com/package/@tosbas/form-zen)
[![npm downloads](https://img.shields.io/npm/d18m/%40tosbas%2Fform-zen)](https://www.npmjs.com/package/@tosbas/form-zen)
[![npm license](https://img.shields.io/npm/l/%40tosbas%2Fform-zen)](https://www.npmjs.com/package/@tosbas/form-zen)

# FormZen

FormZen is a lightweight TypeScript library for generating dynamic browser forms from a simple schema object.

It is dependency-free, easy to use, and designed for modern frontend applications.

---

## ✨ Features

- Generate forms from a declarative schema
- Support for text, email, password, number, textarea, select, checkbox and radio inputs
- Automatic labels and placeholders
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

new FormZen(
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

**Return value:** `string`

---

## 🌐 CDN Usage

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@tosbas/form-zen@1.3.3/dist/form-zen.min.css"
/>

<script src="https://cdn.jsdelivr.net/npm/@tosbas/form-zen@1.3.3/dist/cdn.global.min.js"></script>

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
- Select returns `string` or `string[]` depending on `multiple`
- Each field key becomes the HTML `name` attribute
- Unknown field keys will throw an error (strict mode)

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
