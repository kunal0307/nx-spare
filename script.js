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
// 🔍 INSTANT SEARCH SUGGESTIONS (FIXED TOUCH & CLICK)
// -------------------------------------------------------------
function showSuggestions(input) {
  const val = input.value.trim().toUpperCase();
  const box = input.parentElement.querySelector('.custom-suggestions-box');
  if (!box) return;

  if (!val) {
    renderSuggestionsBox(box, input, masterSpares.slice(0, 2));
    return;
  }

  const matches = masterSpares.filter(item => item.toUpperCase().includes(val)).slice(0, 2);
  
  if (matches.length > 0) {
    renderSuggestionsBox(box, input, matches);
  } else {
    box.classList.add('hidden');
  }
}

function renderSuggestionsBox(box, input, items) {
  box.innerHTML = '';
  items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'custom-suggestion-item';
    div.innerText = it;
    
    // onpointerdown captures touch and click before blur
    div.onpointerdown = function(e) {
      e.preventDefault();
      input.value = it;
      box.classList.add('hidden');
    };
    
    box.appendChild(div);
  });
  box.classList.remove('hidden');
}

// Close suggestions on outside click
document.addEventListener('pointerdown', function(e) {
  if (!e.target.closest('td')) {
    document.querySelectorAll('.custom-suggestions-box').forEach(b => b.classList.add('hidden'));
  }
});

// Mobile Input Validation
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
// 💾 100% BULLETPROOF DIRECT PDF DOWNLOAD
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

  // Collect Items
  const items = [];
  document.querySelectorAll('#itemRows tr').forEach(r => {
    const name = r.querySelector('.item-name')?.value.trim() || '';
    const issuedQty = r.querySelector('.item-issued-qty')?.value || '0';
    const returnQty = r.querySelector('.item-return-qty')?.value || '';
    const consumedQty = r.querySelector('.item-consumed-qty')?.value || '';
    if (name !== '') {
      items.push({ name, issuedQty, returnQty, consumedQty });
    }
  });

  if (items.length === 0) {
    alert("Please add at least one item description before saving!");
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
    items,
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

  // 3. Clone & Convert Inputs to Printed Text
  const element = document.getElementById('challanSheet');
  const filename = `Challan_${challanNo}_${issueDate || 'Draft'}.pdf`;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollY: 0,
      ignoreElements: (element) => element.classList.contains('no-print'),
      onclone: (clonedDoc) => {
        const origInputs = element.querySelectorAll('input, textarea');
        const clonedInputs = clonedDoc.querySelectorAll('#challanSheet input, #challanSheet textarea');
        origInputs.forEach((orig, idx) => {
          if (clonedInputs[idx]) {
            clonedInputs[idx].value = orig.value;
            clonedInputs[idx].setAttribute('value', orig.value);
          }
        });
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);

    showToast(`Challan ${challanNo} Saved!`, "PDF downloaded successfully.");
  } catch (error) {
    console.error("PDF Generate Error:", error);
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
    tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400">No saved challans found in this browser.</td></tr>`;
    return;
  }

  tbody.innerHTML = history.map((c, index) => `
    <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
      <td class="p-2 font-bold text-blue-700">${c.challanNo}</td>
      <td class="p-2">${c.issueDate || '-'}</td>
      <td class="p-2 font-semibold text-slate-800">${c.employeeName || '-'}</td>
      <td class="p-2">${c.siteName || '-'}</td>
      <td class="p-2 text-center font-bold">${c.items ? c.items.length : 0} items</td>
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

  const tbody = document.getElementById('itemRows');
  if (c.items && c.items.length > 0) {
    tbody.innerHTML = c.items.map((item, i) => `
      <tr>
        <td class="border border-black p-1 text-center font-bold sr-no">${i + 1}</td>
        <td class="border border-black p-1 relative">
          <input type="text" autocomplete="off" value="${item.name}" oninput="showSuggestions(this)" onfocus="showSuggestions(this)" placeholder="Type item name..." class="w-full outline-none item-name uppercase bg-transparent font-medium" />
          <div class="custom-suggestions-box hidden no-print"></div>
        </td>
        <td class="border border-black p-1 text-center"><input type="number" value="${item.issuedQty}" oninput="calculateConsumed(this)" class="w-full text-center outline-none font-bold item-issued-qty" /></td>
        <td class="border border-black p-1 text-center"><input type="number" value="${item.returnQty}" oninput="calculateConsumed(this)" class="w-full text-center outline-none font-bold item-return-qty bg-transparent" /></td>
        <td class="border border-black p-1 text-center"><input type="number" value="${item.consumedQty}" class="w-full text-center outline-none font-bold item-consumed-qty bg-transparent" /></td>
        <td class="border border-black p-1 text-center action-col no-print"><button type="button" onclick="deleteRow(this)" class="text-red-600 font-bold text-xs">✖</button></td>
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
// INITIALIZATION & HANDLERS
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

  const tbody = document.getElementById('itemRows');
  tbody.innerHTML = `
    <tr>
      <td class="border border-black p-1 text-center font-bold sr-no">1</td>
      <td class="border border-black p-1 relative">
        <input type="text" autocomplete="off" oninput="showSuggestions(this)" onfocus="showSuggestions(this)" placeholder="Type item name (e.g. MC4, CABLE)..." class="w-full outline-none item-name uppercase bg-transparent font-medium" />
        <div class="custom-suggestions-box hidden no-print"></div>
      </td>
      <td class="border border-black p-1 text-center"><input type="number" oninput="calculateConsumed(this)" class="w-full text-center outline-none font-bold item-issued-qty" /></td>
      <td class="border border-black p-1 text-center"><input type="number" oninput="calculateConsumed(this)" class="w-full text-center outline-none font-bold item-return-qty bg-transparent" /></td>
      <td class="border border-black p-1 text-center"><input type="number" class="w-full text-center outline-none font-bold item-consumed-qty bg-transparent" /></td>
      <td class="border border-black p-1 text-center action-col no-print"><button type="button" onclick="deleteRow(this)" class="text-red-600 font-bold text-xs">✖</button></td>
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

// Add Row
document.getElementById('addBtn').addEventListener('click', function() {
  const tbody = document.getElementById('itemRows');
  const count = tbody.querySelectorAll('tr').length + 1;
  const tr = document.createElement('tr');
  
  tr.innerHTML = `
    <td class="border border-black p-1 text-center font-bold sr-no">${count}</td>
    <td class="border border-black p-1 relative">
      <input type="text" autocomplete="off" oninput="showSuggestions(this)" onfocus="showSuggestions(this)" placeholder="Type item name (e.g. MC4, CABLE)..." class="w-full outline-none item-name uppercase bg-transparent font-medium" />
      <div class="custom-suggestions-box hidden no-print"></div>
    </td>
    <td class="border border-black p-1 text-center"><input type="number" oninput="calculateConsumed(this)" class="w-full text-center outline-none font-bold item-issued-qty" /></td>
    <td class="border border-black p-1 text-center"><input type="number" oninput="calculateConsumed(this)" class="w-full text-center outline-none font-bold item-return-qty bg-transparent" /></td>
    <td class="border border-black p-1 text-center"><input type="number" class="w-full text-center outline-none font-bold item-consumed-qty bg-transparent" /></td>
    <td class="border border-black p-1 text-center action-col no-print"><button type="button" onclick="deleteRow(this)" class="text-red-600 font-bold text-xs">✖</button></td>
  `;
  tbody.appendChild(tr);
});

function deleteRow(btn) {
  const row = btn.closest('tr');
  row.parentNode.removeChild(row);
  
  const allRows = document.querySelectorAll('#itemRows tr');
  allRows.forEach((r, idx) => {
    r.querySelector('.sr-no').innerText = idx + 1;
  });
}