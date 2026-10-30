// Universal Excel (CSV with UTF-8 BOM) and PDF print helper for Admin tables

export function exportToExcelFile({ filename = 'report', headers = [], data = [] }) {
  if (!data || data.length === 0) return false;

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [
    headers.map(h => escapeCsv(h.label)).join(','),
    ...data.map(row => 
      headers.map(h => escapeCsv(typeof h.key === 'function' ? h.key(row) : row[h.key])).join(',')
    )
  ];

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export function exportToPdfPrint({ title = 'Report', subtitle = '', headers = [], data = [] }) {
  if (!data || data.length === 0) return false;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return false;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: landscape; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 20px; color: #1e293b; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: bold; color: #0f172a; margin: 0 0 4px; }
          .sub { font-size: 13px; color: #64748b; margin: 0; }
          .meta { font-size: 12px; color: #0284c7; font-weight: 600; text-align: right; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
          th { background-color: #f1f5f9; color: #334155; font-weight: 700; text-align: left; padding: 10px 12px; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Mana Local - ${title}</div>
            <div class="sub">${subtitle || `Total Records: ${data.length}`}</div>
          </div>
          <div class="meta">
            Generated: ${new Date().toLocaleString()}<br/>
            Total Records: ${data.length}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(h => `<td>${(typeof h.key === 'function' ? h.key(row) : row[h.key]) || '—'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          Mana Local Platform Report • Confidential & Internal Use
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  // Allow styles to load before triggering browser print
  setTimeout(() => {
    printWindow.print();
  }, 400);

  return true;
}

