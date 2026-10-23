# Changelog

All notable changes to FormZen are documented here.

## [2.0.2] - 2026-10-23

### Documentation

- Add the GitHub Pages live demo link to the README.

## [2.0.1] - 2026-10-23

### Changed

- Improve the demo page and CDN stylesheet, and standardize library error messages in English.

## [2.0.0] - 2026-10-19

### Changed

- Always render the form action button as `type="submit"`; its label remains customizable.
- Remove the option to configure the button as `button` or `reset`.
- Use unversioned jsDelivr URLs in the CDN example to follow the latest published npm version, and document optional version pinning.
- Return all selected values for checkbox groups and multiple selects.
- Render radio groups with accessible labels and enforce required checkbox groups.
- Validate field schemas before rendering or adding fields.
- Support mounting directly into an existing `<form>`, removing complete fields, and destroying FormZen-managed markup.
- Add native input constraints and field state options, including `minLength`, `maxLength`, `step`, `autocomplete`, `disabled`, and `readOnly`.
- Omit disabled fields from callback data and validate numeric/date bounds before rendering.

### Compatibility

- The `submitType` constructor argument and button `type` option are no longer supported. The action button always submits the form.
