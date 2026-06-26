// Character sprite sheet registry.
//
// The previous iteration registered AI-generated 8x4 sprite sheets here, but
// the model output was not a reliable grid: frame sizes, poses and alignment
// varied per class, producing visibly broken characters in-game (wrong
// direction shown, frames cut off, scale jumps between animations).
//
// Until we have hand-authored or reliably-batched sheets, we deliberately
// register NOTHING here. `drawCharacterFromSheet` returns false when a class
// has no registered URL, so every class falls through to the procedural
// renderer in `sprites.ts`, which renders consistently across all classes
// and directions.

export function registerAllCharacterSheets() {
  // intentionally empty — see file header
}
