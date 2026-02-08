# ACNH EZ Order Web App

This project is a static web app that lets you search an Animal Crossing: New Horizons catalog, assemble a 40-slot order, and copy a `$ordercat` command for external tooling.

## Getting started

1. Copy the NHSE item text and kind data into `data/nhse/`:
   - `text_item_en.txt`
   - `item_kind.bytes`
2. Copy the unit icon dump assets into `data/unit-icons/`:
   - `imagedump_manual.bytes`
   - `imagedump_manualheader.txt`
   - `BeriPointer_unit.txt`
3. Place item sprites in `resources/sprites/` using the NHSE hex ID naming convention (for example,
   `1021_0.png` for a monstera).
4. Host the repo on GitHub Pages and open `index.html`.

https://lbinderup.github.io/acnh-ez-order/
