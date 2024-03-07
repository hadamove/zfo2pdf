function onFileInputChanged() {
    const input = document.getElementById('fileInput');
    const label = document.querySelector('label[for="fileInput"]');
    const fileName = input.files.length ? input.files[0].name : null;
    label.textContent = fileName ? `📑 ${fileName}` : '📤 Nahraj súbor';

    displayError('');
}

function displayError(message) {
    const errorContainer = document.getElementById('errorContainer');
    if (message) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('hidden');
    } else {
        errorContainer.textContent = '';
        errorContainer.classList.add('hidden');
    }
}

const convertZfoToPdf = () => {
    const fileInput = document.getElementById('fileInput');

    if (!fileInput.files || fileInput.files.length === 0) {
        displayError('Nejprve načti soubor, prosím!');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const zfoContent = event.target.result;
            const xmlContent = extractXmlContentFromZfo(zfoContent);
            transformToPdfAndAddLinks(xmlContent);
        } catch (error) {
            displayError('Nastala chyba při zpracování souboru. Jde o platný soubor ZFO?');
        }
    };

    reader.onerror = function (_) {
        displayError('Nastala chyba při čtení souboru. Zkus to prosím znovu.');
    };

    reader.readAsBinaryString(file);
}

const extractXmlContentFromZfo = (zfoContent) => {
    const pkcs7Der = forge.util.createBuffer(zfoContent, 'binary');
    const pkcs7Asn1 = forge.asn1.fromDer(pkcs7Der);
    const pkcs7 = forge.pkcs7.messageFromAsn1(pkcs7Asn1);

    let xmlContentParts = pkcs7.rawCapture.content.value[0].value;

    let xmlContent = xmlContentParts.map(part => {
        let binaryString = part.value;
        let buffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            buffer[i] = binaryString.charCodeAt(i);
        }

        let textDecoder = new TextDecoder("utf-8");
        return textDecoder.decode(buffer);
    }).join('');

    if (!xmlContent) {
        throw new Error('No XML content found in the ZFO file.');
    }

    return xmlContent;
}

const transformToPdfAndAddLinks = (xmlContent) => {
    const listStylesheet = `
  <xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output omit-xml-declaration="yes"/>
    <xsl:template match="/">
      <xsl:for-each select="//*[local-name()='dmFile']">
        <xsl:value-of select="@dmFileDescr"/>
        <xsl:text>&#xa;</xsl:text>
      </xsl:for-each>
    </xsl:template>
  </xsl:stylesheet>`;
    const fileNames = transformXml(xmlContent, listStylesheet).trim().split('\n');

    const container = document.getElementById('downloadLinks');
    // Clear previous links
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    document.getElementById('result').classList.remove('hidden');

    fileNames.forEach((file) => {
        const dumpStylesheet = `
    <xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
      <xsl:output omit-xml-declaration="yes"/>
      <xsl:template match="/">
        <xsl:value-of select="//*[local-name()='dmFile' and @dmFileDescr='${file}']/*[local-name()='dmEncodedContent']/text()"/>
      </xsl:template>
    </xsl:stylesheet>`;

        const encodedContent = transformXml(xmlContent, dumpStylesheet);
        const decodedContent = atob(encodedContent);
        const byteArray = new Uint8Array(decodedContent.length);
        for (let i = 0; i < decodedContent.length; i++) {
            byteArray[i] = decodedContent.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file;
        a.textContent = `📄 ${file}`;
        a.className = "block w-full py-2 px-4 text-emerald-500 bg-emerald-100 rounded-md hover:bg-emerald-200 transition duration-150 ease-in-out mt-2 flex gap-2 fade-in-pop ";

        container.appendChild(a);
    });
}

const transformXml = (xmlContent, xsltString) => {
    const parser = new DOMParser();
    const xsltProcessor = new XSLTProcessor();

    const xslStylesheet = parser.parseFromString(xsltString, "application/xml");
    xsltProcessor.importStylesheet(xslStylesheet);

    const xmlDoc = parser.parseFromString(xmlContent, "application/xml");
    const fragment = xsltProcessor.transformToFragment(xmlDoc, document);

    const serializer = new XMLSerializer();
    return serializer.serializeToString(fragment);
}

document.getElementById('fileInput').addEventListener('change', onFileInputChanged);
document.getElementById('convertButton').addEventListener('click', convertZfoToPdf);