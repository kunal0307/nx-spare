// -------------------------------------------------------------
// ⚠️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
// -------------------------------------------------------------
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwKmAyJGzJgYm-i0bn5ZiJGSA4Ctf6eLa1SuxG1En5Khp22Vz09MM7Ygm2U6wRPDZqaMw/exec";

// Master Spares List
const masterSpares = [
  "MC4 CONNECTOR (MALE/FEMALE)",
  "SOLAR DC CABLE 4 SQMM",
  "SOLAR DC CABLE 6 SQMM",
  "AC ARMOURED CABLE 3C 6 SQMM",
  "AC ARMOURED CABLE 4C 10 SQMM",
  "MCB 32A DP (DOUBLE POLE)",
  "MCB 63A 4-POLE",
  "DC SPD 1000V (SURGE PROTECTION)",
  "AC SPD 415V",
  "EARTHING CHEMICAL BAG 25KG",
  "COPPER BONDED EARTHING ROD 10FT",
  "GI EARTHING STRIP 25X3 MM",
  "ALUMINUM MID CLAMP 35MM",
  "ALUMINUM END CLAMP 35MM",
  "SS NUT BOLT M8 X 25MM",
  "SS NUT BOLT M10 X 30MM",
  "GI FASTENER 10MM X 75MM",
  "CABLE TIE 200MM / 300MM",
  "COPPER CRIMPING LUGS 4/6/10 SQMM",
  "HEAT SHRINKABLE SLEEVE",
  "PVC CONDUIT PIPE 25MM",
  "FLEXIBLE CONDUIT PIPE",
  "AC DISTRIBUTION BOX (ACDB)",
  "DC DISTRIBUTION BOX (DCDB)"
];

// Master Tools List
const masterTools = [
  "1/2\" CONDUIT / PIPE BENDER",
  "3/4\" CONDUIT / PIPE BENDER",
  "HYDRAULIC CRIMPING TOOL",
  "MANUAL MC4 CRIMPING TOOL",
  "SOLAR CABLE STRIPPER",
  "ROTARY HAMMER DRILL MACHINE",
  "CORDLESS DRILL / DRIVER 18V",
  "ANGLE GRINDER 4 INCH",
  "DIGITAL MULTIMETER (1000V DC/AC)",
  "DIGITAL CLAMP METER (AC/DC)",
  "EARTH TESTER / MEGGER TESTER",
  "SOLAR IRRADIANCE METER",
  "TORQUE WRENCH SET",
  "COMBINATION PLIER 8 INCH",
  "NOSE PLIER 6 INCH",
  "ADJUSTABLE SPANNER 12 INCH",
  "RING & OPEN SPANNER SET (6-32MM)",
  "HEX KEY / ALLEN KEY SET",
  "MEASURING TAPE 5M / 30M",
  "SPIRIT LEVEL / MAGNETIC LEVEL 12\"",
  "HEAVY DUTY EXTENSION BOARD 20M",
  "SAFETY HARNESS / FULL BODY BELT",
  "SAFETY HELMET & SAFETY GLOVES",
  "ALUMINUM EXTENSION LADDER 12FT"
];

// COMPANY PROFILES CONFIGURATION
const companies = {
  compA: {
    name: 'NEXTRO ENERGY ENTERPRISES',
    addressHTML: '<div>BRANCH OFFICE - PLOT NO. B-17, NEAR METRO PILLAR NO. 163,</div><div>NEW ASHOK NAGAR, NEW DELHI – 110096</div>',
    email: 'nextroenergyenterprises@gmail.com',
    phone: '+91 9716588121',
    logoPath: 'images/logo-a.png'
  },
  compB: {
    name: 'PROJECTION ENERGY OPC PVT. LTD',
    addressHTML: '<div>BRANCH OFFICE - PLOT NO. B-17, NEAR METRO PILLAR NO. 163,</div><div>NEW ASHOK NAGAR, NEW DELHI – 110096</div>',
    email: 'projectionenergy@gmail.com',
    phone: '+91 9716588121',
    logoPath: 'images/logo-b.png'
  }
};

// Toast Alert
function showToast(title, message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastTitle').innerText = title;
  document.getElementById('toastMsg').innerText = message;
  
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

// -------------------------------------------------------------
// 🔍 SEARCH SUGGESTIONS FOR SPARES & TOOLS
// -------------------------------------------------------------
function showSuggestions(input, type) {
  const val = input.value.trim().toUpperCase();
  const box = input.parentElement.querySelector('.custom-suggestions-box');
  if (!box) return;

  const dataset = type === 'tools' ? masterTools : masterSpares;

  if (!val) {
    renderSuggestions(box, input, dataset.slice(0, 2));
    return;
  }

  const matches = dataset.filter(item => item.toUpperCase().includes(val)).slice(0, 2);
  
  if (matches.length > 0) {
    renderSuggestions(box, input, matches);
  } else {
    box.classList.add('hidden');
  }
}

function renderSuggestions(box, input, items) {
  box.innerHTML = '';
  items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'custom-suggestion-item';
    div.innerText = it;
    
    div.onpointerdown = function(e) {
      e.preventDefault();
      input.value = it;
      box.classList.add('hidden');
    };
    
    box.appendChild(div);
  });
  box.classList.remove('hidden');
}

// Hide dropdown on outside click
document.addEventListener('pointerdown', function(e) {
  if (!e.target.closest('.custom-suggestions-box') && !e.target.classList.contains('item-name')) {
    document.querySelectorAll('.custom-suggestions-box').forEach(b => b.classList.add('hidden'));
  }
});

// Mobile Input Digits Only
function handleMobileInput(input) {
  let val = input.value;
  if (!val.startsWith('+91 ')) val = '+91 ';
  let digits = val.substring(4).replace(/\D/g, '').substring(0, 10);
  input.value = '+91 ' + digits;
}

function ensureCountryCode(input) {
  if (!input.value.startsWith('+91 ')) input.value = '+91 ';
}

// Uppercase Auto Convert
document.addEventListener('input', function (e) {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
    if (e.target.type === 'text' || e.target.tagName === 'TEXTAREA') {
      if (e.target.id !== 'carrierPhone') {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        e.target.value = e.target.value.toUpperCase();
        e.target.setSelectionRange(start, end);
      }
    }
  }
});

// Fetch Next Challan Number
async function fetchNextChallanFromSheet() {
  const loader = document.getElementById('syncLoader');
  if (loader) loader.classList.remove('hidden');
  
  try {
    if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("REPLACE_WITH_YOUR")) {
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const data = await res.json();
      if (data && data.nextChallanNo) {
        document.getElementById('challanNo').value = data.nextChallanNo;
        if (loader) loader.classList.add('hidden');
        return;
      }
    }
  } catch (err) {
    console.warn("Sheet sync fallback:", err);
  } finally {
    if (loader) loader.classList.add('hidden');
  }

  const year = new Date().getFullYear();
  let lastSerial = parseInt(localStorage.getItem('last_challan_serial') || '0', 10) + 1;
  document.getElementById('challanNo').value = `CH-${year}-${String(lastSerial).padStart(3, '0')}`;
}

// -------------------------------------------------------------
// 💾 100% RELIABLE DIRECT PDF DOWNLOAD (SPARES + TOOLS)
// -------------------------------------------------------------
async function saveChallanAndDownloadPDF() {
  document.querySelectorAll('.custom-suggestions-box').forEach(b => b.classList.add('hidden'));

  const saveBtn = document.getElementById('savePdfBtn');
  const btnIcon = document.getElementById('saveBtnIcon');
  const btnText = document.getElementById('saveBtnText');

  const challanNo = document.getElementById('challanNo').value.trim();
  const issueDate = document.getElementById('issueDate').value;
  const returnDate = document.getElementById('returnDate').value || "--/--/----";
  const employeeName = document.getElementById('carrierName').value.trim();
  const contactNo = document.getElementById('carrierPhone').value.trim();
  const siteName = document.getElementById('destParty').value.trim();
  const siteAddress = document.getElementById('destAddress').value.trim();
  const companyName = document.getElementById('compName').innerText.trim();
  const compKey = document.getElementById('compSelect').value;
  const notes = document.getElementById('notesInput')?.value || '';

  // Gather Spares
  const spares = [];
  document.querySelectorAll('#spareRows tr').forEach(r => {
    const name = r.querySelector('.item-name')?.value.trim() || '';
    const issuedQty = r.querySelector('.item-issued-qty')?.value || '0';
    const returnQty = r.querySelector('.item-return-qty')?.value || '';
    const consumedQty = r.querySelector('.item-consumed-qty')?.value || '';
    if (name !== '') {
      spares.push({ name, issuedQty, returnQty, consumedQty });
    }
  });

  // Gather Tools
  const tools = [];
  document.querySelectorAll('#toolRows tr').forEach(r => {
    const name = r.querySelector('.item-name')?.value.trim() || '';
    const issuedQty = r.querySelector('.tool-issued-qty')?.value || '0';
    const returnQty = r.querySelector('.tool-return-qty')?.value || '';
    if (name !== '') {
      tools.push({ name, issuedQty, returnQty });
    }
  });

  if (spares.length === 0 && tools.length === 0) {
    alert("Please add at least one Spare or Tool before saving!");
    return;
  }

  saveBtn.disabled = true;
  btnIcon.innerText = "⏳";
  btnText.innerText = "Downloading...";

  const payload = {
    challanNo,
    issueDate,
    returnDate,
    compKey,
    companyName,
    employeeName,
    contactNo,
    siteName,
    siteAddress,
    notes,
    spares,
    tools,
    savedAt: new Date().toISOString()
  };

  // 1. Google Sheet Sync
  try {
    if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("REPLACE_WITH_YOUR")) {
      const url = `${GOOGLE_SCRIPT_URL}?action=save&data=${encodeURIComponent(JSON.stringify(payload))}`;
      fetch(url, { mode: 'no-cors' }).catch(err => console.warn("Sheet sync:", err));
    }
  } catch (err) {
    console.error("Sheet error:", err);
  }

  // 2. Save in Local History
  saveToLocalHistory(payload);

  let parts = challanNo.split('-');
  if (parts.length === 3) {
    let sNum = parseInt(parts[2], 10);
    if (!isNaN(sNum)) {
      localStorage.setItem('last_challan_serial', sNum);
    }
  }

  // 3. Clone & Convert Live Inputs to Printed Text Spans
  const element = document.getElementById('challanSheet');
  const clone = element.cloneNode(true);

  // Remove Action Column and Add Buttons
  clone.querySelectorAll('.no-print, .action-col, .custom-suggestions-box').forEach(el => el.remove());

  const originalInputs = element.querySelectorAll('input, textarea');
  const clonedInputs = clone.querySelectorAll('input, textarea');

  originalInputs.forEach((orig, idx) => {
    const target = clonedInputs[idx];
    if (target) {
      const span = document.createElement('span');
      span.innerText = orig.value || orig.placeholder || '';
      span.style.fontWeight = target.classList.contains('font-black') ? '900' : (target.classList.contains('font-bold') ? '700' : '600');
      span.style.fontSize = '12px';
      span.style.textTransform = 'uppercase';
      span.style.display = 'inline-block';
      span.style.width = '100%';
      span.style.color = '#000000';
      span.style.textAlign = target.classList.contains('text-center') ? 'center' : (target.classList.contains('text-right') ? 'right' : 'left');
      target.parentNode.replaceChild(span, target);
    }
  });

  const filename = `Challan_${challanNo}_${issueDate || 'Draft'}.pdf`;
  const opt = {
    margin:       [4, 4, 4, 4],
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(clone).save();
    showToast(`Challan ${challanNo} Downloaded!`, "Saved directly to Downloads folder.");
  } catch (error) {
    console.warn("Direct PDF error, fallback to print:", error);
    window.print();
  } finally {
    saveBtn.disabled = false;
    btnIcon.innerText = "💾";
    btnText.innerText = "Save as PDF";
    renderHistoryTable();

    setTimeout(() => {
      fetchNextChallanFromSheet();
    }, 1000);
  }
}

// -------------------------------------------------------------
// 📋 LOCAL HISTORY LOGIC
// -------------------------------------------------------------
function getLocalHistory() {
  return JSON.parse(localStorage.getItem('saved_challans_history') || '[]');
}

function saveToLocalHistory(newChallan) {
  let history = getLocalHistory();
  const existingIdx = history.findIndex(c => c.challanNo === newChallan.challanNo);
  if (existingIdx >= 0) {
    history[existingIdx] = newChallan;
  } else {
    history.unshift(newChallan);
  }
  localStorage.setItem('saved_challans_history', JSON.stringify(history));
}

function renderHistoryTable() {
  const tbody = document.getElementById('historyRows');
  if (!tbody) return;
  const history = getLocalHistory();

  if (history.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400">No saved challans found.</td></tr>`;
    return;
  }

  tbody.innerHTML = history.map((c, index) => `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
      <td class="p-2 font-bold text-blue-700">${c.challanNo}</td>
      <td class="p-2">${c.issueDate || '-'}</td>
      <td class="p-2 font-semibold text-slate-800">${c.employeeName || '-'}</td>
      <td class="p-2">${c.siteName || '-'}</td>
      <td class="p-2 text-center font-bold text-slate-700">
        ${c.spares ? c.spares.length : 0} Spares / ${c.tools ? c.tools.length : 0} Tools
      </td>
      <td class="p-2 text-center">
        <button onclick="loadChallanFromHistory(${index})" type="button" class="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-2 py-1 rounded text-xs mr-1 cursor-pointer">
          👁️ View
        </button>
        <button onclick="deleteHistoryItem(${index})" type="button" class="text-red-500 hover:text-red-700 font-bold px-1.5 py-1 text-xs cursor-pointer">
          🗑️
        </button>
      </td>
    </tr>
  `).join('');
}

function loadChallanFromHistory(index) {
  const history = getLocalHistory();
  const c = history[index];
  if (!c) return;

  if (c.compKey) {
    document.getElementById('compSelect').value = c.compKey;
    switchCompany(c.compKey);
  }

  document.getElementById('challanNo').value = c.challanNo;
  document.getElementById('issueDate').value = c.issueDate || "";
  
  const returnInput = document.getElementById('returnDate');
  if (c.returnDate && c.returnDate !== "--/--/----") {
    returnInput.type = "date";
    returnInput.value = c.returnDate;
  } else {
    returnInput.type = "text";
    returnInput.value = "";
    returnInput.placeholder = "--/--/----";
  }

  document.getElementById('carrierName').value = c.employeeName || "";
  document.getElementById('carrierPhone').value = c.contactNo || "+91 ";
  document.getElementById('destParty').value = c.siteName || "";
  document.getElementById('destAddress').value = c.siteAddress || "";
  if (document.getElementById('notesInput')) {
    document.getElementById('notesInput').value = c.notes || "";
  }

  // Load Spares
  const spareTbody = document.getElementById('spareRows');
  if (c.spares && c.spares.length > 0) {
    spareTbody.innerHTML = c.spares.map((item, i) => `
      <tr class="spare-entry-row">
        <td class="border border-slate-900 p-1.5 text-center font-bold text-slate-500 spare-sr">${i + 1}</td>
        <td class="border border-slate-900 p-1.5">
          <div class="relative w-full">
            <input type="text" autocomplete="off" value="${item.name}" oninput="showSuggestions(this, 'spares')" onfocus="showSuggestions(this, 'spares')" placeholder="Search spare item..." class="w-full outline-none item-name uppercase bg-transparent font-semibold text-slate-900 text-[12px]" />
            <div class="custom-suggestions-box hidden no-print"></div>
          </div>
        </td>
        <td class="border border-slate-900 p-1.5 text-center"><input type="number" value="${item.issuedQty}" oninput="calculateConsumed(this)" class="w-full text-center outline-none font-bold text-slate-900 item-issued-qty text-[12px]" /></td>
        <td class="border border-slate-900 p-1.5 text-center"><input type="number" value="${item.returnQty}" oninput="calculateConsumed(this)" class="w-full text-center outline-none font-bold text-slate-900 item-return-qty bg-transparent text-[12px]" /></td>
        <td class="border border-slate-900 p-1.5 text-center"><input type="number" value="${item.consumedQty}" class="w-full text-center outline-none font-black text-blue-700 item-consumed-qty bg-transparent text-[12px]" /></td>
        <td class="border border-slate-900 p-1.5 text-center action-col no-print"><button type="button" onclick="deleteSpareRow(this)" class="text-red-500 hover:text-red-700 font-bold text-xs">✖</button></td>
      </tr>
    `).join('');
  }

  // Load Tools
  const toolTbody = document.getElementById('toolRows');
  if (c.tools && c.tools.length > 0) {
    toolTbody.innerHTML = c.tools.map((item, i) => `
      <tr class="tool-entry-row">
        <td class="border border-slate-900 p-1.5 text-center font-bold text-slate-500 tool-sr">${i + 1}</td>
        <td class="border border-slate-900 p-1.5">
          <div class="relative w-full">
            <input type="text" autocomplete="off" value="${item.name}" oninput="showSuggestions(this, 'tools')" onfocus="showSuggestions(this, 'tools')" placeholder="Search tool..." class="w-full outline-none item-name uppercase bg-transparent font-semibold text-slate-900 text-[12px]" />
            <div class="custom-suggestions-box hidden no-print"></div>
          </div>
        </td>
        <td class="border border-slate-900 p-1.5 text-center"><input type="number" value="${item.issuedQty}" class="w-full text-center outline-none font-bold text-slate-900 tool-issued-qty text-[12px]" /></td>
        <td class="border border-slate-900 p-1.5 text-center"><input type="number" value="${item.returnQty}" class="w-full text-center outline-none font-bold text-slate-900 tool-return-qty bg-transparent text-[12px]" /></td>
        <td class="border border-slate-900 p-1.5 text-center action-col no-print"><button type="button" onclick="deleteToolRow(this)" class="text-red-500 hover:text-red-700 font-bold text-xs">✖</button></td>
      </tr>
    `).join('');
  }

  showToast(`Loaded ${c.challanNo}`, "Challan data displayed on sheet.");
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteHistoryItem(index) {
  if (confirm("Are you sure you want to delete this challan from history?")) {
    let history = getLocalHistory();
    history.splice(index, 1);
    localStorage.setItem('saved_challans_history', JSON.stringify(history));
    renderHistoryTable();
  }
}

function clearAllHistory() {
  if (confirm("Are you sure you want to clear all saved challans from this browser?")) {
    localStorage.removeItem('saved_challans_history');
    renderHistoryTable();
  }
}

// -------------------------------------------------------------
// INITIALIZATION & UI HANDLERS
// -------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('issueDate').valueAsDate = new Date();
  
  const returnInput = document.getElementById('returnDate');
  returnInput.type = "text";
  returnInput.value = "";
  returnInput.placeholder = "--/--/----";

  fetchNextChallanFromSheet();
  renderHistoryTable();
});

function createNewChallan() {
  fetchNextChallanFromSheet();
  document.getElementById('issueDate').valueAsDate = new Date();
  
  const returnInput = document.getElementById('returnDate');
  returnInput.type = "text";
  returnInput.value = "";
  returnInput.placeholder = "--/--/----";

  document.getElementById('carrierName').value = "";
  document.getElementById('carrierPhone').value = "+91 ";
  document.getElementById('destParty').value = "";
  document.getElementById('destAddress').value = "";
  if (document.getElementById('notesInput')) {
    document.getElementById('notesInput').value = "";
  }

  document.getElementById('spareRows').innerHTML = `
    <tr class="spare-entry-row">
      <td class="border border-slate-900 p-1.5 text-center font-bold text-slate-500 spare-sr">1</td>
      <td class="border border-slate-900 p-1.5">
        <div class="relative w-full">
          <input type="text" autocomplete="off" oninput="showSuggestions(this, 'spares')" onfocus="showSuggestions(this, 'spares')" placeholder="Search spare item..." class="w-full outline-none item-name uppercase bg-transparent font-semibold text-slate-900 text-[12px]" />
          <div class="custom-suggestions-box hidden no-print"></div>
        </div>
      </td>
      <td class="border border-slate-900 p-1.5 text-center"><input type="number" oninput="calculateConsumed(this)" class="w-full text-center outline-none font-bold text-slate-900 item-issued-qty text-[12px]" /></td>
      <td class="border border-slate-900 p-1.5 text-center"><input type="number" oninput="calculateConsumed(this)" class="w-full text-center outline-none font-bold text-slate-900 item-return-qty bg-transparent text-[12px]" /></td>
      <td class="border border-slate-900 p-1.5 text-center"><input type="number" class="w-full text-center outline-none font-black text-blue-700 item-consumed-qty bg-transparent text-[12px]" /></td>
      <td class="border border-slate-900 p-1.5 text-center action-col no-print"><button type="button" onclick="deleteSpareRow(this)" class="text-red-500 hover:text-red-700 font-bold text-xs">✖</button></td>
    </tr>
  `;

  document.getElementById('toolRows').innerHTML = `
    <tr class="tool-entry-row">
      <td class="border border-slate-900 p-1.5 text-center font-bold text-slate-500 tool-sr">1</td>
      <td class="border border-slate-900 p-1.5">
        <div class="relative w-full">
          <input type="text" autocomplete="off" oninput="showSuggestions(this, 'tools')" onfocus="showSuggestions(this, 'tools')" placeholder="Search tool (e.g. Pipe Bender, Drill)..." class="w-full outline-none item-name uppercase bg-transparent font-semibold text-slate-900 text-[12px]" />
          <div class="custom-suggestions-box hidden no-print"></div>
        </div>
      </td>
      <td class="border border-slate-900 p-1.5 text-center"><input type="number" class="w-full text-center outline-none font-bold text-slate-900 tool-issued-qty text-[12px]" /></td>
      <td class="border border-slate-900 p-1.5 text-center"><input type="number" class="w-full text-center outline-none font-bold text-slate-900 tool-return-qty bg-transparent text-[12px]" /></td>
      <td class="border border-slate-900 p-1.5 text-center action-col no-print"><button type="button" onclick="deleteToolRow(this)" class="text-red-500 hover:text-red-700 font-bold text-xs">✖</button></td>
    </tr>
  `;
}

function switchCompany(key) {
  const c = companies[key];
  document.getElementById('compName').innerText = c.name;
  document.getElementById('compAddress').innerHTML = c.addressHTML;
  document.getElementById('compEmail').innerText = c.email;
  document.getElementById('compPhone').innerText = c.phone;

  const img = document.getElementById('compLogo');
  const text = document.getElementById('logoText');

  img.src = c.logoPath;
  img.classList.remove('hidden');
  text.classList.add('hidden');
}

function handleLogoError() {
  const img = document.getElementById('compLogo');
  const text = document.getElementById('logoText');
  img.classList.add('hidden');
  text.classList.remove('hidden');
  text.innerText = '';
}

function calculateConsumed(element) {
  const row = element.closest('tr');
  const issued = parseFloat(row.querySelector('.item-issued-qty').value) || 0;
  const returnedVal = row.querySelector('.item-return-qty').value;
  const consumedInput = row.querySelector('.item-consumed-qty');

  if (returnedVal !== "") {
    const returned = parseFloat(returnedVal) || 0;
    const consumed = Math.max(0, issued - returned);
    consumedInput.value = consumed;
  }
}

// -------------------------------------------------------------
// ADD & DELETE ROWS FOR SPARES & TOOLS
// -------------------------------------------------------------
document.getElementById('addSpareBtn').addEventListener('click', function() {
  const tbody = document.getElementById('spareRows');
  const count = tbody.querySelectorAll('tr').length + 1;
  const tr = document.createElement('tr');
  tr.className = "spare-entry-row";
  
  tr.innerHTML = `
    <td class="border border-slate-900 p-1.5 text-center font-bold text-slate-500 spare-sr">${count}</td>
    <td class="border border-slate-900 p-1.5">
      <div class="relative w-full">
        <input type="text" autocomplete="off" oninput="showSuggestions(this, 'spares')" onfocus="showSuggestions(this, 'spares')" placeholder="Search spare item..." class="w-full outline-none item-name uppercase bg-transparent font-semibold text-slate-900 text-[12px]" />
        <div class="custom-suggestions-box hidden no-print"></div>
      </div>
    </td>
    <td class="border border-slate-900 p-1.5 text-center"><input type="number" oninput="calculateConsumed(this)" class="w-full text-center outline-none font-bold text-slate-900 item-issued-qty text-[12px]" /></td>
    <td class="border border-slate-900 p-1.5 text-center"><input type="number" oninput="calculateConsumed(this)" class="w-full text-center outline-none font-bold text-slate-900 item-return-qty bg-transparent text-[12px]" /></td>
    <td class="border border-slate-900 p-1.5 text-center"><input type="number" class="w-full text-center outline-none font-black text-blue-700 item-consumed-qty bg-transparent text-[12px]" /></td>
    <td class="border border-slate-900 p-1.5 text-center action-col no-print"><button type="button" onclick="deleteSpareRow(this)" class="text-red-500 hover:text-red-700 font-bold text-xs">✖</button></td>
  `;
  tbody.appendChild(tr);
});

function deleteSpareRow(btn) {
  const row = btn.closest('tr');
  row.parentNode.removeChild(row);
  
  const allRows = document.querySelectorAll('#spareRows tr');
  allRows.forEach((r, idx) => {
    r.querySelector('.spare-sr').innerText = idx + 1;
  });
}

document.getElementById('addToolBtn').addEventListener('click', function() {
  const tbody = document.getElementById('toolRows');
  const count = tbody.querySelectorAll('tr').length + 1;
  const tr = document.createElement('tr');
  tr.className = "tool-entry-row";
  
  tr.innerHTML = `
    <td class="border border-slate-900 p-1.5 text-center font-bold text-slate-500 tool-sr">${count}</td>
    <td class="border border-slate-900 p-1.5">
      <div class="relative w-full">
        <input type="text" autocomplete="off" oninput="showSuggestions(this, 'tools')" onfocus="showSuggestions(this, 'tools')" placeholder="Search tool (e.g. Pipe Bender, Drill)..." class="w-full outline-none item-name uppercase bg-transparent font-semibold text-slate-900 text-[12px]" />
        <div class="custom-suggestions-box hidden no-print"></div>
      </div>
    </td>
    <td class="border border-slate-900 p-1.5 text-center"><input type="number" class="w-full text-center outline-none font-bold text-slate-900 tool-issued-qty text-[12px]" /></td>
    <td class="border border-slate-900 p-1.5 text-center"><input type="number" class="w-full text-center outline-none font-bold text-slate-900 tool-return-qty bg-transparent text-[12px]" /></td>
    <td class="border border-slate-900 p-1.5 text-center action-col no-print"><button type="button" onclick="deleteToolRow(this)" class="text-red-500 hover:text-red-700 font-bold text-xs">✖</button></td>
  `;
  tbody.appendChild(tr);
});

function deleteToolRow(btn) {
  const row = btn.closest('tr');
  row.parentNode.removeChild(row);
  
  const allRows = document.querySelectorAll('#toolRows tr');
  allRows.forEach((r, idx) => {
    r.querySelector('.tool-sr').innerText = idx + 1;
  });
}

// -------------------------------------------------------------
// 💬 DIRECT WHATSAPP GROUP SHARING
// -------------------------------------------------------------
function shareOnWhatsApp() {
  const challanNo = document.getElementById('challanNo').value.trim();
  const issueDate = document.getElementById('issueDate').value;
  const companyName = document.getElementById('compName').innerText.trim();
  const employeeName = document.getElementById('carrierName').value.trim();
  const contactNo = document.getElementById('carrierPhone').value.trim();
  const siteName = document.getElementById('destParty').value.trim();
  const siteAddress = document.getElementById('destAddress').value.trim();

  // 1. Gather Spares
  let sparesText = "";
  document.querySelectorAll('#spareRows tr').forEach((r, idx) => {
    const name = r.querySelector('.item-name')?.value.trim();
    const qty = r.querySelector('.item-issued-qty')?.value || '0';
    if (name) {
      sparesText += `  ${idx + 1}. ${name} (Qty: ${qty})\n`;
    }
  });

  // 2. Gather Tools
  let toolsText = "";
  document.querySelectorAll('#toolRows tr').forEach((r, idx) => {
    const name = r.querySelector('.item-name')?.value.trim();
    const qty = r.querySelector('.tool-issued-qty')?.value || '0';
    if (name) {
      toolsText += `  ${idx + 1}. ${name} (Qty: ${qty})\n`;
    }
  });

  // 3. Create Professional Formatted WhatsApp Message
  let message = `*📦 ${companyName}*\n`;
  message += `*📋 CHALLAN NO:* ${challanNo}\n`;
  message += `*📅 DATE:* ${issueDate}\n`;
  message += `------------------------------------\n`;
  message += `*👤 ISSUED TO:* ${employeeName || 'N/A'} (${contactNo})\n`;
  message += `*📍 SITE:* ${siteName || 'N/A'}\n`;
  if (siteAddress) message += `*🏢 LOCATION:* ${siteAddress}\n`;
  message += `------------------------------------\n`;

  if (sparesText) {
    message += `*⚙️ SPARES & FITTINGS:*\n${sparesText}\n`;
  }
  if (toolsText) {
    message += `*🛠️ TOOLS & EQUIPMENT:*\n${toolsText}\n`;
  }

  message += `_Generated via Issue Challan System_`;

  // 4. Open WhatsApp
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}