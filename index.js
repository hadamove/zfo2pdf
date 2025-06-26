// Translations
const translations = {
	cs: {
		"step1-title": "Načti soubor:",
		"step1-desc":
			'klikni na tlačítko "Načti soubor" a vyber soubor datové schránky ze kterého chceš extrahovat přílohy.',
		"step2-title": "Konvertuj:",
		"step2-desc":
			'Po načtení souboru klikni na tlačítko "Konvertuj" a počkej na dokončení konverze.',
		"step3-title": "Ulož:",
		"step3-desc":
			"Po dokončení konverze se ti zobrazí odkazy na stažení jednotlivých příloh. Klikni na odkaz a ulož si přílohu na svůj počítač.",
		"security-title": "Bezpečnostní informace",
		"privacy-title": "Soukromí:",
		"privacy-desc":
			"Soubory nejsou odesílány na žádný server, konverze probíhá ve vašem prohlížeči. Pro ověření můžete stránku načíst, vypnout internetové připojení a nástroj bude stále fungovat.",
		"warning-title": "Upozornění:",
		"warning-desc":
			"Nástroj pouze extrahuje přílohy ze souboru ZFO a nekontroluje jejich integritu, certifikát nebo obsah. Používejte tento nástroj pouze s důvěryhodnými soubory.",
		"load-file-btn": "Načti soubor",
		"convert-btn": "Konvertuj",
		"attachments-title": "PŘÍLOHY",
		"error-no-file": "Nejprve načti soubor, prosím!",
		"error-processing":
			"Nastala chyba při zpracování souboru. Jde o platný soubor ZFO?",
		"error-reading": "Nastala chyba při čtení souboru. Zkus to prosím znovu.",
		"file-selected": "Soubor vybrán",
		"lang-button": "🇬🇧 EN",
		"page-title": "ZFO ➡️ PDF konverter",
		"page-description":
			"Konverze ZFO na PDF: Převeďte své soubory datové schránky ZFO na PDF snadno a bezpečně přímo ve vašem prohlížeči.",
	},
	en: {
		"step1-title": "Load file:",
		"step1-desc":
			'click the "Load file" button and select the data box file from which you want to extract attachments.',
		"step2-title": "Convert:",
		"step2-desc":
			'After loading the file, click the "Convert" button and wait for the conversion to complete.',
		"step3-title": "Save:",
		"step3-desc":
			"After the conversion is complete, download links for individual attachments will appear. Click the link and save the attachment to your computer.",
		"security-title": "Security Information",
		"privacy-title": "Privacy:",
		"privacy-desc":
			"Files are not sent to any server, conversion happens in your browser. For verification, you can load the page, disconnect from the internet and the tool will still work.",
		"warning-title": "Warning:",
		"warning-desc":
			"This tool only extracts attachments from the ZFO file and does not verify their integrity, certificate or content. Use this tool only with trusted files.",
		"load-file-btn": "Load file",
		"convert-btn": "Convert",
		"attachments-title": "ATTACHMENTS",
		"error-no-file": "Please load a file first!",
		"error-processing":
			"An error occurred while processing the file. Is it a valid ZFO file?",
		"error-reading":
			"An error occurred while reading the file. Please try again.",
		"file-selected": "File selected",
		"lang-button": "🇨🇿 CS",
		"page-title": "ZFO ➡️ PDF converter",
		"page-description":
			"ZFO to PDF Conversion: Convert your Czech data box ZFO files to PDF easily and securely directly in your browser.",
	},
};

// Current language state
let currentLang = "cs";

// Language switching functionality
function switchLanguage() {
	currentLang = currentLang === "cs" ? "en" : "cs";
	updatePageLanguage();
	localStorage.setItem("preferred-language", currentLang);
}

function updatePageLanguage() {
	// Update document lang attribute
	document.documentElement.lang = currentLang;

	// Update page title
	document.title = translations[currentLang]["page-title"];

	// Update meta description
	const description = document.querySelector('meta[name="description"]');
	if (description) {
		description.content = translations[currentLang]["page-description"];
	}

	// Update language button
	const langButton = document.getElementById("langSwitch");
	langButton.textContent = translations[currentLang]["lang-button"];

	// Update all translatable elements
	const translatableElements = document.querySelectorAll("[data-translate]");
	for (const element of translatableElements) {
		const key = element.getAttribute("data-translate");
		if (translations[currentLang][key]) {
			element.textContent = translations[currentLang][key];
		}
	}

	// Update file input label if file is selected
	const fileInput = document.getElementById("fileInput");
	if (fileInput.files && fileInput.files.length > 0) {
		onFileInputChanged();
	}
}

// Initialize language on page load
function initializeLanguage() {
	// Check for saved language preference
	const savedLang = localStorage.getItem("preferred-language");
	if (savedLang && translations[savedLang]) {
		currentLang = savedLang;
	}
	updatePageLanguage();
}

function onFileInputChanged() {
	const input = document.getElementById("fileInput");
	const label = document.querySelector('label[for="fileInput"]');
	const fileName = input.files.length ? input.files[0].name : null;

	const loadFileText = translations[currentLang]["load-file-btn"];
	label.innerHTML = fileName
		? `📑 ${fileName}`
		: `📤 <span data-translate="load-file-btn">${loadFileText}</span>`;

	displayError("");
}

function displayError(message) {
	const errorContainer = document.getElementById("errorContainer");
	if (message) {
		errorContainer.textContent = message;
		errorContainer.classList.remove("hidden");
	} else {
		errorContainer.textContent = "";
		errorContainer.classList.add("hidden");
	}
}

const convertZfoToPdf = () => {
	const fileInput = document.getElementById("fileInput");

	if (!fileInput.files || fileInput.files.length === 0) {
		displayError(translations[currentLang]["error-no-file"]);
		return;
	}

	const file = fileInput.files[0];
	const reader = new FileReader();

	reader.onload = (event) => {
		try {
			const zfoContent = event.target.result;
			const xmlContent = extractXmlContentFromZfo(zfoContent);
			transformToPdfAndAddLinks(xmlContent);
		} catch (error) {
			displayError(translations[currentLang]["error-processing"]);
		}
	};

	reader.onerror = (_) => {
		displayError(translations[currentLang]["error-reading"]);
	};

	reader.readAsBinaryString(file);
};

const extractXmlContentFromZfo = (zfoContent) => {
	const pkcs7Der = forge.util.createBuffer(zfoContent, "binary");
	const pkcs7Asn1 = forge.asn1.fromDer(pkcs7Der);
	const pkcs7 = forge.pkcs7.messageFromAsn1(pkcs7Asn1);

	const xmlContentParts = pkcs7.rawCapture.content.value[0].value;

	const xmlContent = xmlContentParts
		.map((part) => {
			const binaryString = part.value;
			const buffer = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				buffer[i] = binaryString.charCodeAt(i);
			}

			const textDecoder = new TextDecoder("utf-8");
			return textDecoder.decode(buffer);
		})
		.join("");

	if (!xmlContent) {
		throw new Error("No XML content found in the ZFO file.");
	}

	return xmlContent;
};

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
	const fileNames = transformXml(xmlContent, listStylesheet).trim().split("\n");

	const container = document.getElementById("downloadLinks");
	// Clear previous links
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
	document.getElementById("result").classList.remove("hidden");

	for (const file of fileNames) {
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
		const a = document.createElement("a");
		a.href = url;
		a.download = file;
		a.textContent = `📄 ${file}`;
		a.className =
			"block w-full py-2 px-4 text-emerald-500 bg-emerald-100 rounded-md hover:bg-emerald-200 transition duration-150 ease-in-out mt-2 flex gap-2 fade-in-pop ";

		container.appendChild(a);
	}
};

const transformXml = (xmlContent, xsltString) => {
	const parser = new DOMParser();
	const xsltProcessor = new XSLTProcessor();

	const xslStylesheet = parser.parseFromString(xsltString, "application/xml");
	xsltProcessor.importStylesheet(xslStylesheet);

	const xmlDoc = parser.parseFromString(xmlContent, "application/xml");
	const fragment = xsltProcessor.transformToFragment(xmlDoc, document);

	const serializer = new XMLSerializer();
	return serializer.serializeToString(fragment);
};

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
	initializeLanguage();

	document
		.getElementById("fileInput")
		.addEventListener("change", onFileInputChanged);
	document
		.getElementById("convertButton")
		.addEventListener("click", convertZfoToPdf);
	document
		.getElementById("langSwitch")
		.addEventListener("click", switchLanguage);
});
