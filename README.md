# ZFO ➡️ PDF Converter

A web-based tool for extracting PDF documents and attachments from Czech government and business communications (.zfo) received through the official data box system (datové schránky).

Available in **Czech** and **English** at [https://hadamove.github.io/zfo2pdf/](https://hadamove.github.io/zfo2pdf/).

## What it does

- **Load**: Select a ZFO file from your Czech data box
- **Convert**: Extract PDF attachments from the ZFO file  
- **Save**: Download the extracted attachments to your computer

## How it Works

ZFO (Zpráva Formulář Odpověď) files from Czech data boxes are essentially **signed XML documents** wrapped in a **PKCS #7 cryptographic envelope**. The extraction process works as follows:

### Zfo File Structure
```
ZFO File = PKCS #7 Signed Container
    └── XML Document (UTF-8)
        └── <dmFiles> with Base64-encoded attachments
```

### Extraction Process
1. **Parse PKCS #7 container** - Remove the cryptographic envelope using Forge.js
2. **Extract XML content** - Decode the inner XML document containing message data
3. **Locate attachments** - Find `<dmEncodedContent>` elements within `<dmFile>` tags
4. **Decode Base64** - Convert Base64 strings back to original PDF binary data
5. **Generate downloads** - Create blob URLs for browser download

### XML Structure Example
```xml
<dmFiles xmlns="http://isds.czechpoint.cz/v20">
  <dmFile dmFileDescr="invoice.pdf" dmMimeType="application/pdf">
    <dmEncodedContent>JVBERi0xLjQKJcfsj6IK...</dmEncodedContent>
  </dmFile>
</dmFiles>
```

The tool uses **XSLT transformations** to query the XML and **browser APIs** (File API, Blob API) to handle downloads. All processing happens client-side for maximum privacy.

## Security Note

This tool only extracts attachments from ZFO files and does not verify their integrity, certificates, or content. Use only with trusted files.
