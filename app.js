// ─── Tab Switching ─────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab + '-tab').classList.add('active');
    if (tab.dataset.tab === 'history') renderHistory();
  });
});

// ─── Set today's date ──────────────────────────────────────────────
document.getElementById('field-date').valueAsDate = new Date();

// ─── Get jsPDF safely ──────────────────────────────────────────────
function getJsPDF() {
  if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
  return null;
}

// ─── Collect Form Data ─────────────────────────────────────────────
function collectFormData() {
  const form = document.getElementById('order-form');
  const fd = new FormData(form);
  const data = {};

  data.date = fd.get('date') || '';
  data.customer = fd.get('customer') || '';
  data.invoice = fd.get('invoice') || '';
  data.phone = fd.get('phone') || '';
  data.po = fd.get('po') || '';
  data.contact = fd.get('contact') || '';

  data.tarp_style = fd.get('tarp_style') || '';
  data.tarp_style_other = fd.get('tarp_style_other') || '';
  if (data.tarp_style === 'Other' && data.tarp_style_other) {
    data.tarp_style = 'Other: ' + data.tarp_style_other;
  }

  data.tarp_color = fd.get('tarp_color') || '';
  data.tarp_color_other = fd.get('tarp_color_other') || '';
  if (data.tarp_color === 'Other' && data.tarp_color_other) {
    data.tarp_color = 'Other: ' + data.tarp_color_other;
  }

  data.material = fd.get('material') || '';
  data.length = fd.get('length') || '';
  data.width = fd.get('width') || '';
  data.trailer_brand = fd.get('trailer_brand') || '';

  data.extras = fd.getAll('extras');
  data.pipe_1_length = fd.get('pipe_1_length') || '';
  data.pipe_2_length = fd.get('pipe_2_length') || '';
  data.pipe_3_length = fd.get('pipe_3_length') || '';
  data.srt_misc = fd.get('srt_misc') || '';
  data.misc_detail = fd.get('misc_detail') || '';

  data.pulls = fd.get('pulls') || '';
  data.pull_length = fd.get('pull_length') || '';
  data.bows_info = fd.get('bows_info') || '';
  data.notes = fd.get('notes') || '';

  return data;
}

// ─── Generate PDF ──────────────────────────────────────────────────
function generatePDF(data) {
  const PDF = getJsPDF();
  if (!PDF) return null;

  const doc = new PDF('p', 'pt', 'letter');
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 40;

  function addLine(label, value, x, yPos, labelW) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(label, x, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || ''), x + (labelW || 80), yPos);
  }

  function addSection(title, yPos) {
    doc.setDrawColor(180);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageW - margin, yPos);
    yPos += 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(title, margin, yPos);
    return yPos + 18;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Tarp Order Form', pageW / 2, y, { align: 'center' });
  y += 30;

  const col2 = pageW / 2 + 20;
  addLine('Date:', formatDate(data.date), margin, y);
  y += 18;
  addLine('Customer:', data.customer, margin, y);
  addLine('Invoice:', data.invoice, col2, y);
  y += 18;
  addLine('Phone:', data.phone, margin, y);
  addLine('PO#:', data.po, col2, y);
  y += 18;
  addLine('Contact:', data.contact, margin, y);
  y += 24;

  y = addSection('Tarp Style', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(data.tarp_style || '—', margin + 4, y);
  y += 20;

  y = addSection('Tarp Color', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(data.tarp_color || '—', margin + 4, y);
  y += 20;

  y = addSection('Material & Dimensions', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const matLine = [
    data.material,
    data.length ? 'Length: ' + data.length : '',
    data.width ? 'Width: ' + data.width : '',
    data.trailer_brand ? 'Trailer: ' + data.trailer_brand : ''
  ].filter(Boolean).join('    |    ');
  doc.text(matLine || '—', margin + 4, y);
  y += 20;

  y = addSection('Extra Items', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  if (data.extras.length === 0) {
    doc.text('None', margin + 4, y);
    y += 16;
  } else {
    const extrasWithDetails = data.extras.map(e => {
      if (e === '1" Pipe' && data.pipe_1_length) return e + ' (Length: ' + data.pipe_1_length + ')';
      if (e === '2" Pipe' && data.pipe_2_length) return e + ' (Length: ' + data.pipe_2_length + ')';
      if (e === '3" Pipe' && data.pipe_3_length) return e + ' (Length: ' + data.pipe_3_length + ')';
      if (e === 'SRT Misc' && data.srt_misc) return e + ': ' + data.srt_misc;
      if (e === 'Misc' && data.misc_detail) return e + ': ' + data.misc_detail;
      return e;
    });

    const colItems = Math.ceil(extrasWithDetails.length / 2);
    for (let i = 0; i < colItems; i++) {
      doc.text('•  ' + extrasWithDetails[i], margin + 4, y);
      if (extrasWithDetails[i + colItems]) {
        doc.text('•  ' + extrasWithDetails[i + colItems], col2, y);
      }
      y += 16;
    }
  }

  y = addSection('Build Info', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  addLine('# Pulls:', data.pulls, margin, y);
  addLine('Pull Length:', data.pull_length, col2, y);
  y += 18;
  if (data.bows_info) {
    addLine('Bows:', '', margin, y);
    y += 4;
    const bowLines = doc.splitTextToSize(data.bows_info, pageW - margin * 2 - 10);
    doc.text(bowLines, margin + 4, y);
    y += bowLines.length * 14;
  }

  if (data.notes) {
    y += 6;
    y = addSection('Notes', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const noteLines = doc.splitTextToSize(data.notes, pageW - margin * 2 - 10);
    doc.text(noteLines, margin + 4, y);
  }

  return doc;
}

// ─── Helper: build PDF blob + filename ─────────────────────────────
function buildPDF() {
  const data = collectFormData();
  if (!data.customer) {
    showToast('Please enter a customer name');
    return null;
  }
  if (!getJsPDF()) {
    showToast('PDF library not loaded — please refresh the page');
    return null;
  }
  const doc = generatePDF(data);
  if (!doc) {
    showToast('Error generating PDF');
    return null;
  }
  const filename = buildFilename(data);
  return { doc, data, filename };
}

// ─── Save PDF (download) ──────────────────────────────────────────
document.getElementById('btn-save-pdf').addEventListener('click', () => {
  const result = buildPDF();
  if (!result) return;

  result.doc.save(result.filename);
  saveToHistory(result.data, result.filename);
  showToast('PDF saved!');
});

// ─── Share (native share sheet — works on iPad) ───────────────────
document.getElementById('btn-share').addEventListener('click', async () => {
  const result = buildPDF();
  if (!result) return;

  const blob = result.doc.output('blob');
  const file = new File([blob], result.filename, { type: 'application/pdf' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Tarp Order — ' + result.data.customer,
        files: [file]
      });
      saveToHistory(result.data, result.filename);
      showToast('Shared!');
    } catch (err) {
      if (err.name !== 'AbortError') {
        showToast('Share cancelled');
      }
    }
  } else {
    result.doc.save(result.filename);
    saveToHistory(result.data, result.filename);
    showToast('PDF downloaded (share not supported on this browser)');
  }
});

// ─── History ───────────────────────────────────────────────────────
function getHistory() {
  try { return JSON.parse(localStorage.getItem('trav_history') || '[]'); }
  catch { return []; }
}

function saveToHistory(data, filename) {
  const history = getHistory();
  history.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    customer: data.customer,
    invoice: data.invoice,
    filename: filename,
    formData: data
  });
  localStorage.setItem('trav_history', JSON.stringify(history));
}

function renderHistory() {
  const list = document.getElementById('history-list');
  const history = getHistory();

  if (history.length === 0) {
    list.innerHTML = '<p class="empty-state">No orders yet.</p>';
    return;
  }

  list.innerHTML = history.map(item => `
    <div class="history-card" data-id="${item.id}">
      <div class="history-info">
        <div class="history-customer">${esc(item.customer)}${item.invoice ? ' — #' + esc(item.invoice) : ''}</div>
        <div class="history-meta">${formatTimestamp(item.timestamp)}</div>
      </div>
      <div class="history-actions">
        <button class="btn btn-primary btn-sm" onclick="redownload('${item.id}')">PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="loadOrder('${item.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteOrder('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

window.redownload = function(id) {
  const item = getHistory().find(h => h.id === Number(id));
  if (!item) return;
  if (!getJsPDF()) { showToast('PDF library not loaded'); return; }
  const doc = generatePDF(item.formData);
  if (doc) doc.save(item.filename);
  showToast('PDF downloaded');
};

window.loadOrder = function(id) {
  const item = getHistory().find(h => h.id === Number(id));
  if (!item) return;
  populateForm(item.formData);
  document.querySelector('[data-tab="form"]').click();
  showToast('Order loaded');
};

window.deleteOrder = function(id) {
  const history = getHistory().filter(h => h.id !== Number(id));
  localStorage.setItem('trav_history', JSON.stringify(history));
  renderHistory();
  showToast('Order deleted');
};

document.getElementById('btn-clear-history').addEventListener('click', () => {
  if (confirm('Delete all order history?')) {
    localStorage.removeItem('trav_history');
    renderHistory();
    showToast('History cleared');
  }
});

// ─── Populate Form ─────────────────────────────────────────────────
function populateForm(data) {
  const form = document.getElementById('order-form');
  form.reset();

  const setText = (name, val) => {
    const el = form.querySelector(`[name="${name}"]`);
    if (el) el.value = val || '';
  };

  setText('date', data.date);
  setText('customer', data.customer);
  setText('invoice', data.invoice);
  setText('phone', data.phone);
  setText('po', data.po);
  setText('contact', data.contact);
  setText('length', data.length);
  setText('trailer_brand', data.trailer_brand);
  setText('pulls', data.pulls);
  setText('pull_length', data.pull_length);
  setText('bows_info', data.bows_info);
  setText('notes', data.notes);
  setText('pipe_1_length', data.pipe_1_length);
  setText('pipe_2_length', data.pipe_2_length);
  setText('pipe_3_length', data.pipe_3_length);
  setText('srt_misc', data.srt_misc);
  setText('misc_detail', data.misc_detail);

  const setRadio = (name, val) => {
    if (!val) return;
    let cleanVal = val;
    if (val.startsWith('Other: ')) {
      cleanVal = 'Other';
      const otherInput = form.querySelector(`[name="${name}_other"]`);
      if (otherInput) otherInput.value = val.replace('Other: ', '');
    }
    const radio = form.querySelector(`[name="${name}"][value="${cleanVal}"]`);
    if (radio) radio.checked = true;
  };

  setRadio('tarp_style', data.tarp_style);
  setRadio('tarp_color', data.tarp_color);
  setRadio('material', data.material);
  setRadio('width', data.width);

  if (data.extras) {
    data.extras.forEach(val => {
      const cb = form.querySelector(`[name="extras"][value="${val}"]`);
      if (cb) cb.checked = true;
    });
  }
}

// ─── Helpers ───────────────────────────────────────────────────────
function buildFilename(data) {
  const datePart = data.date || new Date().toISOString().slice(0, 10);
  const custPart = (data.customer || 'order').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  return `TarpOrder_${custPart}_${datePart}.pdf`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => t.classList.add('hidden'), 2500);
}
