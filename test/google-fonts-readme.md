# Google Fonts Support in q5.js

This feature adds support for loading Google Fonts directly in q5.js using the `loadFont()` function.

## Usage

```javascript
// Load a Google Font
let robotoFont = await loadFont(
  "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
);

// Use the font
textFont("Roboto"); // Font name as in Google Fonts
textWeight(300); // Light weight
text("Hello World", 100, 100);

textWeight(700); // Bold weight
text("Hello World", 100, 150);

textStyle("italic");
text("Hello World", 100, 200);
```

## How It Works

The implementation:

1. Detects Google Fonts URLs (starting with 'https://fonts.googleapis.com/css')
2. Fetches the CSS stylesheet
3. Parses the CSS to extract @font-face rules
4. Loads each font face using the FontFace API
5. Makes the font available for use with `textFont()`

## Features

- Supports all Google Fonts
- Handles multiple weights and styles
- Works with variable fonts
- Supports font animations with `textWeight()`
- Compatible with both Canvas 2D and WebGPU renderers

## Example

See the `google-fonts-test.html` file for a complete example that demonstrates:

- Loading multiple Google Fonts
- Using different weights and styles
- Animating font weight

## Notes

- This feature is implemented as part of the core q5.js library, not as an addon module
- The implementation uses the browser's FontFace API, so it should work in most modern browsers
- For WebGPU renderer, the implementation delegates to the Canvas 2D renderer for Google Fonts loading
