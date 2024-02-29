import forge from 'node-forge';
import fs from 'fs';
import { Xslt, XmlParser } from 'xslt-processor';



// Define a function to read and parse the PKCS#7 message
function extractXmlContentFromPkcs7(filePath, outputFilePath) {
    // Read the PKCS#7 message from a file
    const pkcs7Data = fs.readFileSync(filePath, 'binary');

    // Convert binary data to a forge buffer
    const pkcs7Der = forge.util.createBuffer(pkcs7Data, 'binary');

    // Convert DER to ASN.1 object
    const pkcs7Asn1 = forge.asn1.fromDer(pkcs7Der);

    // Convert ASN.1 object to PKCS#7 object
    const pkcs7 = forge.pkcs7.messageFromAsn1(pkcs7Asn1);

    // Assuming the first part of the content is what we're interested in
    // and it contains an array of parts that make up the XML content
    let xmlContentParts = pkcs7.rawCapture.content.value[0].value;
    let xmlContent = xmlContentParts.map(part => part.value).join('');

    // Save the extracted XML content to a file
    fs.writeFileSync(outputFilePath, xmlContent);
    console.log(`Extracted XML content has been saved to: ${outputFilePath}`);

    return xmlContent;
}

// Specify the path to your PKCS#7 file and the output file for the extracted XML
const pkcs7FilePath = 'files-ema/zprava_1306585205_prijata.zfo';
const outputXmlFilePath = 'extracted.xml';

// Call the function to extract and save the XML content
const xmlContent = extractXmlContentFromPkcs7(pkcs7FilePath, outputXmlFilePath);

// Initialize the XSLT and XML parser
const xslt = new Xslt();
const xmlParser = new XmlParser();

// XSLT to list all attachments
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

// Process the listing of file names
const fileListXml = xslt.xsltProcess(
    xmlParser.xmlParse(xmlContent),
    xmlParser.xmlParse(listStylesheet)
);

let fileNames = fileListXml.trim().split('\n');

// Dump all attachments
fileNames.forEach(file => {
    const dumpStylesheet = `
    <xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
      <xsl:output omit-xml-declaration="yes"/>
      <xsl:template match="/">
        <xsl:value-of select="//*[local-name()='dmFile' and @dmFileDescr='${file}']/*[local-name()='dmEncodedContent']/text()"/>
      </xsl:template>
    </xsl:stylesheet>`;

    const encodedContentXml = xslt.xsltProcess(
        xmlParser.xmlParse(xmlContent),
        xmlParser.xmlParse(dumpStylesheet)
    );

    const decodedContent = Buffer.from(encodedContentXml, 'base64');
    fs.writeFileSync(file, decodedContent);
});
