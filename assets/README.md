# Assets Folder

This folder should contain:

## Required Assets

### App Icon
- **icon.png** - 1024x1024px PNG (iOS/Android app icon)
- **adaptive-icon.png** - 1024x1024px PNG (Android adaptive icon)

### Splash Screen
- **splash.png** - 2048x2048px PNG (splash screen image)

### Favicon
- **favicon.png** - 48x48px PNG (web favicon)

## How to Add Assets

1. Create PNG files with the dimensions above
2. Place them in this `assets/` folder
3. Expo will automatically use them based on `app.json` configuration

## Placeholder Icons

For development, you can use emoji-style icons or generate placeholders at:
- https://icon.kitchen/
- https://www.flaticon.com/
- https://www.iconfinder.com/

## Notes

- Use transparent backgrounds for icons
- Use solid colors for splash screen background
- Optimize images to reduce app size
- Consider using vector formats (SVG) when possible

For now, Expo will use default placeholders if these files are missing.
