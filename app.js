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

// ─── Form Type Switching ──────────────────────────────────────────
document.querySelectorAll('.form-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.form-type-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const formId = btn.dataset.form === 'bid' ? 'bid-form' : 'order-form';
    document.getElementById(formId).classList.add('active');
  });
});

// ─── Set today's date ──────────────────────────────────────────────
document.getElementById('field-date').valueAsDate = new Date();
document.getElementById('bid-date').valueAsDate = new Date();

// ─── Get jsPDF safely ──────────────────────────────────────────────
function getJsPDF() {
  if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
  return null;
}

// ─── Which form is active? ─────────────────────────────────────────
function activeFormType() {
  return document.querySelector('.form-type-btn.active').dataset.form;
}

// ═══════════════════════════════════════════════════════════════════
// MANUFACTURING TEMPLATE — collect + PDF
// ═══════════════════════════════════════════════════════════════════
function collectMfgData() {
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

  data.tarp_colors = fd.getAll('tarp_color');
  data.tarp_color_other = fd.get('tarp_color_other') || '';
  if (data.tarp_colors.includes('Other') && data.tarp_color_other) {
    data.tarp_colors = data.tarp_colors.map(c => c === 'Other' ? 'Other: ' + data.tarp_color_other : c);
  }

  data.materials = fd.getAll('material');
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

function generateMfgPDF(data) {
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
  doc.text('Manufacturing Template', pageW / 2, y, { align: 'center' });
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
  const colors = data.tarp_colors || (data.tarp_color ? [data.tarp_color] : []);
  doc.text(colors.length ? colors.join(', ') : '—', margin + 4, y);
  y += 20;

  y = addSection('Material & Dimensions', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const mats = data.materials || (data.material ? [data.material] : []);
  const matLine = [
    mats.length ? mats.join(', ') : '',
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

// ═══════════════════════════════════════════════════════════════════
// BID ESTIMATE — collect + PDF
// ═══════════════════════════════════════════════════════════════════
function collectBidData() {
  const form = document.getElementById('bid-form');
  const fd = new FormData(form);
  const g = name => fd.get(name) || '';
  return {
    customer: g('bid_customer'),
    phone: g('bid_phone'),
    date: g('bid_date'),
    price_4500: g('bid_4500'),
    price_install: g('bid_install'),
    tarp_size: g('bid_tarp_size'),
    front_cap: g('bid_front_cap'), front_cap_price: g('bid_front_cap_price'),
    trinity_cap: g('bid_trinity_cap'), trinity_cap_price: g('bid_trinity_cap_price'),
    rear_cap: g('bid_rear_cap'), rear_cap_price: g('bid_rear_cap_price'),
    swing_gate: g('bid_swing_gate'), swing_gate_price: g('bid_swing_gate_price'),
    remote: g('bid_remote'), remote_price: g('bid_remote_price'),
    bows_qty: g('bid_bows_qty'), bows_price: g('bid_bows_price'),
    latch_qty: g('bid_latch_qty'), latch_price: g('bid_latch_price'),
    tstop_qty: g('bid_tstop_qty'), tstop_price: g('bid_tstop_price'),
    tstop6_qty: g('bid_tstop6_qty'), tstop6_price: g('bid_tstop6_price'),
    pipe2_qty: g('bid_2pipe_qty'), pipe2_price: g('bid_2pipe_price'),
    pipe3_qty: g('bid_3pipe_qty'), pipe3_price: g('bid_3pipe_price'),
    pipe1_qty: g('bid_1pipe_qty'), pipe1_price: g('bid_1pipe_price'),
    tarp_style: g('bid_tarp_style'),
    tarp_style_other: g('bid_tarp_style_other'),
    color: g('bid_color'),
    oz18: g('bid_18oz'),
    oz22: g('bid_22oz'),
    width: g('bid_width'),
    bow_reinf: g('bid_bow_reinf'), bow_reinf_price: g('bid_bow_reinf_price'),
    side_reinf: g('bid_side_reinf'), side_reinf_price: g('bid_side_reinf_price'),
    notes: g('bid_notes'),
  };
}

function generateBidPDF(data) {
  const PDF = getJsPDF();
  if (!PDF) return null;

  const doc = new PDF('p', 'pt', 'letter');
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const rightCol = pageW - margin;
  let y = 40;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Bid Estimate', pageW / 2, y, { align: 'center' });
  y += 30;

  // Header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.customer, margin + 70, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Phone:', pageW / 2 + 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.phone, pageW / 2 + 70, y);
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(data.date), margin + 70, y);
  y += 24;

  // Divider helper
  function divider() {
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, rightCol, y);
    y += 4;
  }

  // Section header helper
  function sectionTitle(title) {
    divider();
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(title, margin, y);
    y += 16;
    doc.setFontSize(10);
  }

  // Price line helper
  function priceLine(label, price) {
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin + 8, y);
    if (price) {
      doc.text('$' + price, rightCol, y, { align: 'right' });
    }
    y += 16;
  }

  // YES/NO price line helper
  function yesNoLine(label, val, price) {
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin + 8, y);
    const choice = val || '—';
    doc.text(choice, pageW / 2, y, { align: 'center' });
    if (price && val === 'YES') {
      doc.text('$' + price, rightCol, y, { align: 'right' });
    }
    y += 16;
  }

  // Qty price line helper
  function qtyLine(label, qty, price) {
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin + 8, y);
    if (qty) doc.text('x' + qty, pageW / 2 - 30, y, { align: 'right' });
    if (price) doc.text('$' + price + ' ea', rightCol, y, { align: 'right' });
    y += 16;
  }

  // ── Base Pricing
  sectionTitle('Base Pricing');
  doc.setFont('helvetica', 'bold');
  doc.text('Item', margin + 8, y);
  doc.text('Cost', rightCol, y, { align: 'right' });
  y += 14;
  priceLine('Basic 4500 System', data.price_4500);
  priceLine('Full Installation', data.price_install);

  // ── Extras
  sectionTitle("Extra's");
  if (data.tarp_size) {
    doc.setFont('helvetica', 'normal');
    doc.text('Tarp Size: ' + data.tarp_size, margin + 8, y);
    y += 16;
  }
  yesNoLine('Front End Cap', data.front_cap, data.front_cap_price);
  yesNoLine('Trinity End Cap', data.trinity_cap, data.trinity_cap_price);
  yesNoLine('Rear End Cap', data.rear_cap, data.rear_cap_price);
  yesNoLine('Rear Swing Gate', data.swing_gate, data.swing_gate_price);
  yesNoLine('Remote', data.remote, data.remote_price);

  // ── Items
  sectionTitle('Items');
  doc.setFont('helvetica', 'bold');
  doc.text('Item', margin + 8, y);
  doc.text('Qty', pageW / 2 - 30, y, { align: 'right' });
  doc.text('Cost ea.', rightCol, y, { align: 'right' });
  y += 14;
  qtyLine('Bows', data.bows_qty, data.bows_price);
  qtyLine('Latch Plate', data.latch_qty, data.latch_price);
  qtyLine('Tarp Stops Regular', data.tstop_qty, data.tstop_price);
  qtyLine('Tarp Stop 6"', data.tstop6_qty, data.tstop6_price);
  qtyLine('2" Roll Pipe', data.pipe2_qty, data.pipe2_price);
  qtyLine('3-1/4" Roll Pipe', data.pipe3_qty, data.pipe3_price);
  qtyLine('1" Pipe', data.pipe1_qty, data.pipe1_price);

  // ── Tarp Details
  sectionTitle('Tarp Details');
  let style = data.tarp_style || '—';
  if (style === 'Other' && data.tarp_style_other) style = 'Other: ' + data.tarp_style_other;
  doc.setFont('helvetica', 'normal');
  doc.text('Tarp Style: ' + style, margin + 8, y); y += 16;
  doc.text('Color: ' + (data.color || '—'), margin + 8, y); y += 16;

  const details = [
    ['18 oz', data.oz18],
    ['22 oz', data.oz22],
    ['Width', data.width],
  ];
  details.forEach(([label, val]) => {
    doc.text(label + ':', margin + 8, y);
    doc.text(val || '—', margin + 140, y);
    y += 16;
  });

  yesNoLine('Bow Reinforcements', data.bow_reinf, data.bow_reinf_price);
  yesNoLine('Side Reinforcements', data.side_reinf, data.side_reinf_price);

  // ── Notes
  if (data.notes) {
    sectionTitle('Notes');
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(data.notes, pageW - margin * 2 - 16);
    doc.text(noteLines, margin + 8, y);
    y += noteLines.length * 14;
  }

  // ── Footer
  y += 20;
  divider();
  y += 12;
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(10);
  doc.text('50% deposit required to start — Balance due on pickup', pageW / 2, y, { align: 'center' });

  return doc;
}

// ═══════════════════════════════════════════════════════════════════
// UNIFIED SAVE / SHARE
// ═══════════════════════════════════════════════════════════════════
function buildCurrentPDF() {
  if (!getJsPDF()) {
    showToast('PDF library not loaded — please refresh');
    return null;
  }

  const type = activeFormType();
  let data, doc, filename;

  if (type === 'bid') {
    data = collectBidData();
    if (!data.customer) { showToast('Please enter a customer name'); return null; }
    doc = generateBidPDF(data);
    filename = buildFilename(data, 'BidEstimate');
  } else {
    data = collectMfgData();
    if (!data.customer) { showToast('Please enter a customer name'); return null; }
    doc = generateMfgPDF(data);
    filename = buildFilename(data, 'TarpOrder');
  }

  if (!doc) { showToast('Error generating PDF'); return null; }
  return { doc, data, filename, type };
}

// Manufacturing buttons
document.getElementById('btn-save-pdf').addEventListener('click', () => {
  const r = buildCurrentPDF();
  if (!r) return;
  r.doc.save(r.filename);
  saveToHistory(r.data, r.filename, r.type);
  showToast('PDF saved!');
});

document.getElementById('btn-share').addEventListener('click', () => sharePDF());

// Bid buttons
document.getElementById('btn-save-bid-pdf').addEventListener('click', () => {
  const r = buildCurrentPDF();
  if (!r) return;
  r.doc.save(r.filename);
  saveToHistory(r.data, r.filename, r.type);
  showToast('PDF saved!');
});

document.getElementById('btn-share-bid').addEventListener('click', () => sharePDF());

async function sharePDF() {
  const r = buildCurrentPDF();
  if (!r) return;

  const blob = r.doc.output('blob');
  const file = new File([blob], r.filename, { type: 'application/pdf' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ title: r.filename.replace('.pdf', ''), files: [file] });
      saveToHistory(r.data, r.filename, r.type);
      showToast('Shared!');
    } catch (err) {
      if (err.name !== 'AbortError') showToast('Share cancelled');
    }
  } else {
    r.doc.save(r.filename);
    saveToHistory(r.data, r.filename, r.type);
    showToast('PDF downloaded (share not supported on this browser)');
  }
}

// ═══════════════════════════════════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════════════════════════════════
function getHistory() {
  try { return JSON.parse(localStorage.getItem('trav_history') || '[]'); }
  catch { return []; }
}

function saveToHistory(data, filename, type) {
  const history = getHistory();
  history.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    customer: data.customer,
    invoice: data.invoice || '',
    filename,
    type: type || 'manufacturing',
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

  list.innerHTML = history.map(item => {
    const typeLabel = item.type === 'bid' ? 'Bid Estimate' : 'Manufacturing';
    return `
    <div class="history-card" data-id="${item.id}">
      <div class="history-info">
        <div class="history-customer">${esc(item.customer)}${item.invoice ? ' — #' + esc(item.invoice) : ''}</div>
        <div class="history-meta">
          <span class="history-type-badge ${item.type === 'bid' ? 'badge-bid' : 'badge-mfg'}">${typeLabel}</span>
          ${formatTimestamp(item.timestamp)}
        </div>
      </div>
      <div class="history-actions">
        <button class="btn btn-primary btn-sm" onclick="redownload('${item.id}')">PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="loadOrder('${item.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteOrder('${item.id}')">Delete</button>
      </div>
    </div>`;
  }).join('');
}

window.redownload = function(id) {
  const item = getHistory().find(h => h.id === Number(id));
  if (!item) return;
  if (!getJsPDF()) { showToast('PDF library not loaded'); return; }
  const doc = item.type === 'bid' ? generateBidPDF(item.formData) : generateMfgPDF(item.formData);
  if (doc) doc.save(item.filename);
  showToast('PDF downloaded');
};

window.loadOrder = function(id) {
  const item = getHistory().find(h => h.id === Number(id));
  if (!item) return;

  // Switch to correct form type
  const targetBtn = document.querySelector(`.form-type-btn[data-form="${item.type === 'bid' ? 'bid' : 'manufacturing'}"]`);
  if (targetBtn) targetBtn.click();

  if (item.type === 'bid') {
    populateBidForm(item.formData);
  } else {
    populateMfgForm(item.formData);
  }

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

// ═══════════════════════════════════════════════════════════════════
// POPULATE FORMS
// ═══════════════════════════════════════════════════════════════════
function populateMfgForm(data) {
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
  setRadio('width', data.width);

  const setChecks = (name, vals) => {
    if (!vals) return;
    vals.forEach(val => {
      let cleanVal = val;
      if (val.startsWith('Other: ')) {
        cleanVal = 'Other';
        const otherInput = form.querySelector(`[name="${name}_other"]`);
        if (otherInput) otherInput.value = val.replace('Other: ', '');
      }
      const cb = form.querySelector(`[name="${name}"][value="${cleanVal}"]`);
      if (cb) cb.checked = true;
    });
  };

  setChecks('tarp_color', data.tarp_colors || (data.tarp_color ? [data.tarp_color] : []));
  setChecks('material', data.materials || (data.material ? [data.material] : []));
  setChecks('extras', data.extras);
}

function populateBidForm(data) {
  const form = document.getElementById('bid-form');
  form.reset();

  const setText = (name, val) => {
    const el = form.querySelector(`[name="${name}"]`);
    if (el) el.value = val || '';
  };

  setText('bid_customer', data.customer);
  setText('bid_phone', data.phone);
  setText('bid_date', data.date);
  setText('bid_4500', data.price_4500);
  setText('bid_install', data.price_install);
  setText('bid_tarp_size', data.tarp_size);
  setText('bid_front_cap_price', data.front_cap_price);
  setText('bid_trinity_cap_price', data.trinity_cap_price);
  setText('bid_rear_cap_price', data.rear_cap_price);
  setText('bid_swing_gate_price', data.swing_gate_price);
  setText('bid_remote_price', data.remote_price);
  setText('bid_bows_qty', data.bows_qty);
  setText('bid_bows_price', data.bows_price);
  setText('bid_latch_qty', data.latch_qty);
  setText('bid_latch_price', data.latch_price);
  setText('bid_tstop_qty', data.tstop_qty);
  setText('bid_tstop_price', data.tstop_price);
  setText('bid_tstop6_qty', data.tstop6_qty);
  setText('bid_tstop6_price', data.tstop6_price);
  setText('bid_2pipe_qty', data.pipe2_qty);
  setText('bid_2pipe_price', data.pipe2_price);
  setText('bid_3pipe_qty', data.pipe3_qty);
  setText('bid_3pipe_price', data.pipe3_price);
  setText('bid_1pipe_qty', data.pipe1_qty);
  setText('bid_1pipe_price', data.pipe1_price);
  setText('bid_tarp_style_other', data.tarp_style_other);
  setText('bid_color', data.color);
  setText('bid_bow_reinf_price', data.bow_reinf_price);
  setText('bid_side_reinf_price', data.side_reinf_price);
  setText('bid_notes', data.notes);

  const setRadio = (name, val) => {
    if (!val) return;
    const radio = form.querySelector(`[name="${name}"][value="${val}"]`);
    if (radio) radio.checked = true;
  };

  setRadio('bid_front_cap', data.front_cap);
  setRadio('bid_trinity_cap', data.trinity_cap);
  setRadio('bid_rear_cap', data.rear_cap);
  setRadio('bid_swing_gate', data.swing_gate);
  setRadio('bid_remote', data.remote);
  setRadio('bid_tarp_style', data.tarp_style);
  setRadio('bid_18oz', data.oz18);
  setRadio('bid_22oz', data.oz22);
  setRadio('bid_width', data.width);
  setRadio('bid_bow_reinf', data.bow_reinf);
  setRadio('bid_side_reinf', data.side_reinf);
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════
function buildFilename(data, prefix) {
  const datePart = data.date || new Date().toISOString().slice(0, 10);
  const custPart = (data.customer || 'order').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  return `${prefix}_${custPart}_${datePart}.pdf`;
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
