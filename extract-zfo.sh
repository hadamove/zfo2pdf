#!/bin/bash
# verify and strip signature
xml="$(openssl smime -inform DER -verify -noverify -in "$1")"

# Save the xml to other file
echo "$xml" > ./idk.xml

# Load the xml from file
xml=$(<./idk.xml)

# list all attachments
stylesheet='
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output omit-xml-declaration="yes"/>
<xsl:template match="/">
<xsl:for-each select="'"//*[local-name()='dmFile']"'">
<xsl:value-of select="@dmFileDescr"/>
<xsl:text>&#xa;</xsl:text>
</xsl:for-each>
</xsl:template>
</xsl:stylesheet>'

file_names="$(xsltproc <(printf '%s' "$stylesheet") - <<<"$xml")"
echo "$file_names"


# dump all attachments
while read -r file; do
  stylesheet='
    <xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
      <xsl:output omit-xml-declaration="yes"/>
      <xsl:template match="/">
        <xsl:value-of select="'"//*[local-name()='dmFile' and @dmFileDescr='$file']/*[local-name()='dmEncodedContent']/text()"'"/>
      </xsl:template>
    </xsl:stylesheet>'
  xsltproc <(printf '%s' "$stylesheet") - <<<"$xml" | base64 -d > "$file"

done <<<"$file_names"
