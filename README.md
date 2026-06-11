# FormZen

FormZen is a lightweight TypeScript library for generating dynamic browser forms from a simple schema object.

It is dependency-free, easy to use, and designed for modern frontend applications.


## Features

- Generate forms from a declarative config
- Support for text, email, password, number, textarea, select, checkbox and radio inputs
- Automatic labels and placeholders
- Clean callback output with string or array values
- TypeScript support

## 📦 Installation

```bash
npm install @tosbas/formzen
```

## Quick start

```ts
import { FormZen } from "@tosbas/formzen";

new FormZen("#app", {
  username: {
    type: "text",
    label: "Username",
    required: true,
    placeholder: "Enter your username"
  },
  email: {
    type: "email",
    label: "Email",
    required: true
  },
  hobbies: {
    type: "checkbox",
    label: "Hobbies",
    options: ["Sport", "Music", "Coding"]
  }
}, (data) => {
  console.log("Submitted data:", data);
});
```

## CDN Usage

You can use FormZen directly in the browser via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@tosbas/formzen@latest/dist/index.global.js"></script>

<script>
  const form = new FormZen("#app", {
    name: { type: "text", label: "Name", required: true },
    email: { type: "email", label: "Email", required: true }
  }, (data) => {
    console.log(data);
  });
</script>
```

## Supported field types

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

## Notes

- Checkbox fields return arrays of selected values.
- Other inputs return strings.
- Select fields can use `options` for choices.

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
