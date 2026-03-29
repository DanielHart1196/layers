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
- Before substantial implementation work in `layers`, review the relevant sections of `PROJECT_NOTES.md` and keep the current architecture direction explicit while working.
- If a request appears to conflict with the agreed architecture in `PROJECT_NOTES.md`, call that out before coding and explain the tradeoff instead of silently drifting.
- If a prompt is underspecified in a way that risks rework, propose a concrete assumption set or ask a short clarifying question before making structural changes.
- When a new rule, architecture decision, or repeated pitfall becomes clear during work, suggest adding it to `PROJECT_NOTES.md` rather than keeping it implicit.
- After JavaScript edits in `layers`, run `node --check` on changed JS files before finishing.
- Keep behavior-preserving extraction separate from behavior-changing refactors. If a change touches rendering cadence, gesture semantics, projection math, or other fragile interaction paths, say so explicitly before making it.
- Prefer small, self-contained changes that preserve code health and are easy to review, test, and revert.
- For UI controls, rows, toggles, chevrons, pickers, panels, sliders, and similar interactions in `layers`, always reuse the existing markup structure, event wiring pattern, CSS class contract, and state model from the nearest working example.
- Do not invent a new component pattern, alternate DOM structure, or parallel interaction model when an equivalent working pattern already exists in the codebase.
- When extending an existing UI pattern to new data, copy the proven pattern first and only change the identifiers, labels, and state bindings required for the new item.
- Before implementing a new UI interaction in `layers`, identify the exact existing file and section it should mirror, and use that as the implementation template.
- If a requested UI change cannot be implemented by reusing an existing pattern, say that explicitly before coding and explain what constraint prevents reuse.
- Prefer structural reuse of existing patterns over one-off fixes, custom wrappers, or new layout abstractions, even if the custom approach appears faster at first.
- Prefer preserving working mobile gesture behavior and fixing browser-specific issues in the narrowest path possible.
- For flat projections in `layers`, keep raster and vector layers on the same camera transform model to avoid alignment drift.
- When touching fragile areas like rendering, gestures, or projection switching, include a concrete regression checklist in the final response so validation is targeted instead of generic.
- For layout, overflow, clipping, and rendering regressions in `layers`, prefer root-cause fixes over containment hacks.
- Do not hide UI/layout bugs with container-level clipping, overflow suppression, or similar band-aids unless the user explicitly asks for that kind of temporary fix.
- When something becomes sideways-scrollable, clipped, misaligned, or visually overflows, first identify which child element is exceeding its intended bounds and fix that element or its layout contract.
- If the quickest available fix is a containment hack rather than a structural fix, say so explicitly before applying it.
