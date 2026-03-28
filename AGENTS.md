# Layers Agent Instructions

## Git Shortcut
- If the user says `gp`, run:
  1. `git add .`
  2. `git commit -m "<assistant-chosen message>"`
  3. `git push origin main`
- Choose a concise, descriptive commit message based on the current diff.
- If there are no staged changes after `git add .`, skip commit and still run `git push origin main`.
- Never ask to run `gp`; only run it when the user says `gp`.

## Screenshot Checks
- When the user asks to check a screenshot, latest screenshot, or recent screenshots, first look in:
  - `/sdcard/DCIM/Screenshots`
  - `/storage/emulated/0/DCIM/Screenshots`
  - `/sdcard/Pictures/Screenshots`
  - `/storage/emulated/0/Pictures/Screenshots`
- Default behavior:
  - sort by most recent modified time
  - inspect the latest relevant screenshot unless the user asks for a specific file
- First try reading Android screenshot folders without escalated permissions.
- Only retry with escalated filesystem access if the non-escalated read fails or does not return the Android screenshot folders.
- After locating the file, use the image viewer tool on the exact path and describe what is visible before proposing fixes.

## Layers Project Notes
- The `layers` repo lives at `/data/data/com.termux/files/home/layers`.
- After JavaScript edits in `layers`, run `node --check` on changed JS files before finishing.
- For UI controls, rows, toggles, chevrons, pickers, panels, sliders, and similar interactions in `layers`, always reuse the existing markup structure, event wiring pattern, CSS class contract, and state model from the nearest working example.
- Do not invent a new component pattern, alternate DOM structure, or parallel interaction model when an equivalent working pattern already exists in the codebase.
- When extending an existing UI pattern to new data, copy the proven pattern first and only change the identifiers, labels, and state bindings required for the new item.
- Before implementing a new UI interaction in `layers`, identify the exact existing file and section it should mirror, and use that as the implementation template.
- If a requested UI change cannot be implemented by reusing an existing pattern, say that explicitly before coding and explain what constraint prevents reuse.
- Prefer structural reuse of existing patterns over one-off fixes, custom wrappers, or new layout abstractions, even if the custom approach appears faster at first.
- Prefer preserving working mobile gesture behavior and fixing browser-specific issues in the narrowest path possible.
- For flat projections in `layers`, keep raster and vector layers on the same camera transform model to avoid alignment drift.
- For layout, overflow, clipping, and rendering regressions in `layers`, prefer root-cause fixes over containment hacks.
- Do not hide UI/layout bugs with container-level clipping, overflow suppression, or similar band-aids unless the user explicitly asks for that kind of temporary fix.
- When something becomes sideways-scrollable, clipped, misaligned, or visually overflows, first identify which child element is exceeding its intended bounds and fix that element or its layout contract.
- If the quickest available fix is a containment hack rather than a structural fix, say so explicitly before applying it.
