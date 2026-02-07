# ACNH EZ Order Web App

This project is a static web app that lets you search an Animal Crossing: New Horizons catalog, assemble a 40-slot order, and copy a `$order` command for external tooling.

## Getting started

1. Update `data/items.json` with your full catalog (exported from your Unity project).
2. Download sprites into the `sprites/` directory and set each item’s `sprite` field to match the local file path.
3. Host the repo on GitHub Pages and open `index.html`.

## Catalog data format

Each item entry should look like this:

```json
{
  "name": "Wooden Chair",
  "category": "Furniture",
  "variant": "Natural",
  "sprite": "sprites/wooden-chair.png",
  "commandName": "wooden-chair"
}
```

- `commandName` is optional. If omitted, a slug is generated from the `name`.
