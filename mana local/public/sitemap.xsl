<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>XML Sitemap - OurLocal</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            background-color: #f9fafb;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 960px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
            border: 1px solid #e5e7eb;
          }
          .header {
            background: #111827;
            color: #ffffff;
            padding: 28px 32px;
          }
          .header h1 {
            margin: 0 0 8px 0;
            font-size: 24px;
            font-weight: 700;
          }
          .header p {
            margin: 0;
            color: #9ca3af;
            font-size: 14px;
          }
          .table-wrapper {
            padding: 24px 32px;
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          th {
            text-align: left;
            padding: 12px 16px;
            background-color: #f3f4f6;
            color: #374151;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
          }
          td {
            padding: 14px 16px;
            border-bottom: 1px solid #e5e7eb;
            color: #4b5563;
          }
          tr:hover td {
            background-color: #f9fafb;
          }
          a {
            color: #f59e0b;
            font-weight: 600;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
            color: #d97706;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 500;
            background-color: #eff6ff;
            color: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>OurLocal - XML Sitemap</h1>
            <p>Generated for search engines like Google, Bing &amp; Yahoo. Total URLs: <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></p>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style="width: 55%;">URL</th>
                  <th style="width: 15%;">Priority</th>
                  <th style="width: 15%;">Changefreq</th>
                  <th style="width: 15%;">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td>
                      <xsl:variable name="itemURL">
                        <xsl:value-of select="sitemap:loc"/>
                      </xsl:variable>
                      <a href="{$itemURL}">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    <td>
                      <span class="badge">
                        <xsl:value-of select="sitemap:priority"/>
                      </span>
                    </td>
                    <td>
                      <xsl:value-of select="sitemap:changefreq"/>
                    </td>
                    <td>
                      <xsl:value-of select="sitemap:lastmod"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
