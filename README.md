# ZFO to️ PDF Converter

A web-based tool for extracting PDF documents and attachments from Czech government and business communications (.zfo) received through the official data box system (datové schránky).

## What it does

- **Load**: Select a ZFO file from your Czech data box
- **Convert**: Extract PDF attachments from the ZFO file  
- **Save**: Download the extracted attachments to your computer

## Key Features

- **Privacy-focused**: All processing happens in your browser - no files are sent to any server
- **Offline-first**: Works offline once loaded - you can disconnect from the internet and it still functions

## Use Cases

Perfect for extracting PDF documents and attachments from Czech government and business communications received through the official data box system (datové schránky).

## Security Note

This tool only extracts attachments from ZFO files and does not verify their integrity, certificates, or content. Use only with trusted files.

## Deployment

This project is ready for GitHub Pages deployment:

1. **Fork or clone** this repository
2. **Enable GitHub Pages** in your repository settings
3. **Set source** to "GitHub Actions"
4. **Push to main branch** - the GitHub Actions workflow will automatically build and deploy

The site will be available at `https://yourusername.github.io/zfo2pdf`

### Local Development

```bash
npm install
npm run build
```

Then open `index.html` in your browser.

---

Made by [zfox.cz](mailto:info@zfox.cz)
