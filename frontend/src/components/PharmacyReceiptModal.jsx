import React from 'react';
import { Printer, ShieldCheck, Clock, X } from 'lucide-react';

export default function PharmacyReceiptModal({ ticket, onClose }) {
  if (!ticket) return null;

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const pharmacyName = ticket.pharmacy || 'Apollo Pharmacy (24x7)';
  const address = ticket.address || '12 Main Road, Anna Nagar';
  const phone = ticket.phone || '+91 98401 23456';
  const price = (ticket.price || 45.00).toFixed(2);

  // Dedicated, foolproof print function that guarantees the receipt is never blank
  const handlePrint = () => {
    // 1. Create a dedicated hidden iframe for printing
    let iframe = document.getElementById('receipt-print-frame');
    if (iframe) {
      document.body.removeChild(iframe);
    }
    iframe = document.createElement('iframe');
    iframe.id = 'receipt-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pharmacy Hold Receipt - ${ticket.code}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { background: white; color: #0f172a; padding: 20px; display: flex; justify-content: center; }
            .receipt-container { width: 100%; max-width: 580px; border: 2px dashed #059669; border-radius: 18px; padding: 24px; background: white; }
            .badge { display: inline-block; background: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 800; padding: 3px 12px; border-radius: 9999px; border: 1px solid #a7f3d0; text-transform: uppercase; margin-bottom: 6px; }
            .text-center { text-align: center; }
            .pharmacy-title { font-size: 22px; font-weight: 900; color: #022c22; text-transform: uppercase; margin-bottom: 2px; }
            .sub-text { font-size: 12px; color: #4b5563; }
            .mono-header { font-family: monospace; font-size: 11px; color: #64748b; margin-top: 4px; }
            .divider { border-bottom: 2px dashed #cbd5e1; margin: 16px 0; }
            
            .passcode-card { background: #f8fafc; border: 2px dashed #10b981; border-radius: 14px; padding: 16px; text-align: center; margin: 16px 0; }
            .passcode-sub { font-size: 10px; font-weight: 800; color: #047857; text-transform: uppercase; background: #d1fae5; display: inline-block; padding: 2px 8px; border-radius: 9999px; margin-bottom: 6px; }
            .passcode-label { font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 2px; text-transform: uppercase; }
            .passcode-num { font-size: 38px; font-weight: 900; font-family: monospace; color: #047857; letter-spacing: 4px; margin: 4px 0; }
            .barcode { height: 38px; width: 250px; margin: 6px auto; background: repeating-linear-gradient(90deg, #0f172a, #0f172a 2px, transparent 2px, transparent 4px, #0f172a 4px, #0f172a 7px, transparent 7px, transparent 8px); }
            
            .grid-details { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; margin: 16px 0; font-size: 12px; }
            .grid-label { font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; }
            .grid-val { font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px; }

            .med-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
            .med-table th { background: #f1f5f9; padding: 9px 12px; text-align: left; font-weight: 800; color: #334155; }
            .med-table td { padding: 10px 12px; border-top: 1px solid #f1f5f9; }
            .med-table tfoot td { background: #f8fafc; font-weight: 800; border-top: 2px solid #cbd5e1; font-size: 13px; }

            .footer-rules { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; }
            .stamp-box { border-bottom: 1px solid #94a3b8; width: 130px; text-align: center; padding-bottom: 4px; font-family: monospace; font-size: 11px; color: #64748b; font-style: italic; }
            
            @media print {
              body { padding: 0; }
              .receipt-container { border: 2px solid #059669; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="text-center">
              <span class="badge">✔ Verified Retail Pharmacy Partner</span>
              <h1 class="pharmacy-title">${pharmacyName}</h1>
              <p class="sub-text">${address}</p>
              <p class="mono-header">
                📞 ${phone} • DL: DL-20B/48921/24 • GSTIN: 33AAACR2948P1Z8
              </p>
            </div>

            <div class="divider"></div>

            <div class="passcode-card">
              <span class="passcode-sub">60-Minute Counter Reservation Pass</span>
              <div class="passcode-label">Counter Claim Passcode</div>
              <div class="passcode-num">${ticket.code}</div>
              <div class="barcode"></div>
              <p style="font-size: 11px; color: #047857; font-weight: 700; margin-top: 6px;">
                ⚠️ Present this code to the dispensing chemist. Medicine is locked until expiry.
              </p>
            </div>

            <div class="grid-details">
              <div>
                <div class="grid-label">Patient Name:</div>
                <div class="grid-val">${ticket.patient}</div>
              </div>
              <div>
                <div class="grid-label">Hold Status:</div>
                <div class="grid-val" style="color: #047857;">● ACTIVE (Locked)</div>
              </div>
              <div>
                <div class="grid-label">Reserved On:</div>
                <div class="grid-val">${currentDate} at ${currentTime}</div>
              </div>
              <div>
                <div class="grid-label">Hold Duration:</div>
                <div class="grid-val" style="color: #dc2626;">60 Mins Window</div>
              </div>
            </div>

            <table class="med-table">
              <thead>
                <tr>
                  <th>Medication Name</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Counter MRP</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${ticket.medicine}</strong>
                    <div style="font-size: 10px; color: #64748b;">Active Pharmaceutical Salt</div>
                  </td>
                  <td style="text-align: center; font-weight: bold;">1 Unit</td>
                  <td style="text-align: right; font-weight: bold;">₹${price}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="text-align: right; text-transform: uppercase;">Total Payable at Counter:</td>
                  <td style="text-align: right; color: #047857; font-size: 15px;">₹${price}</td>
                </tr>
              </tfoot>
            </table>

            <div class="footer-rules">
              <div>
                <strong>Counter Instructions:</strong><br/>
                • No advance payment required online.<br/>
                • Pay cash / UPI at the store billing desk.<br/>
                • If drug requires Doctor's Rx, present original slip.
              </div>
              <div style="text-align: center;">
                <div class="stamp-box">Pharm. Verified</div>
                <div style="font-size: 9px; margin-top: 3px;">Chemist Stamp</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Trigger print directly on the isolated document
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative my-8 animate-in fade-in duration-200">
        
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Official Pharmacy Hold Receipt Slip
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <Printer className="h-3.5 w-3.5" /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div id="printable-receipt" className="p-6 md:p-8 bg-white text-slate-900 font-sans space-y-6">
          
          {/* Pharmacy Letterhead */}
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-5 space-y-1">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
              <ShieldCheck className="h-3 w-3 text-emerald-600" /> Verified Retail Pharmacy Partner
            </div>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight uppercase">
              {pharmacyName}
            </h2>
            <p className="text-xs text-slate-600 font-medium">{address}</p>
            <p className="text-[11px] text-slate-500 font-mono">
              📞 {phone} • DL No: DL-20B/48921/24 • GSTIN: 33AAACR2948P1Z8
            </p>
          </div>

          {/* Receipt Title & Hold Passcode Box */}
          <div className="bg-slate-50 border-2 border-dashed border-emerald-500 rounded-2xl p-4 text-center space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
              60-Minute Counter Reservation Pass
            </span>
            
            <div className="pt-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Counter Claim Passcode
              </p>
              <p className="text-3xl md:text-4xl font-mono font-black text-emerald-700 tracking-widest select-all">
                {ticket.code}
              </p>
            </div>

            {/* Simulated Barcode */}
            <div className="py-1 flex flex-col items-center justify-center">
              <div className="h-9 w-64 bg-[repeating-linear-gradient(90deg,#0f172a,#0f172a_2px,transparent_2px,transparent_4px,#0f172a_4px,#0f172a_7px,transparent_7px,transparent_8px,#0f172a_8px,#0f172a_12px,transparent_12px,transparent_14px)] opacity-85"></div>
              <span className="text-[9px] font-mono text-slate-400 mt-0.5">*{ticket.code}*</span>
            </div>

            <p className="text-[11px] text-slate-600 font-semibold">
              ⚠️ Present this code to the dispensing chemist. Medicine is locked until expiry.
            </p>
          </div>

          {/* Patient & Voucher Timestamps */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Patient Name:</span>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{ticket.patient}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Hold Status:</span>
              <p className="font-extrabold text-emerald-700 text-sm mt-0.5 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> ACTIVE (Locked)
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Reserved On:</span>
              <p className="font-medium text-slate-700">{currentDate} at {currentTime}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Hold Duration:</span>
              <p className="font-bold text-rose-600 flex items-center gap-1">
                <Clock className="h-3 w-3" /> 60 Mins Window
              </p>
            </div>
          </div>

          {/* Itemized Prescription Table */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Reserved Medication Details:
            </span>
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Medication Name</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Counter MRP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5">
                    <p className="font-extrabold text-slate-900">{ticket.medicine}</p>
                    <p className="text-[10px] text-slate-500">Active Pharmaceutical Salt</p>
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-800">1 Unit</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">
                    ₹{price}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <tr>
                  <td colSpan="2" className="p-2.5 text-right text-xs uppercase">Total Payable at Counter:</td>
                  <td className="p-2.5 text-right text-sm text-emerald-800 font-black">
                    ₹{price}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Terms & Pharmacist Signature Box */}
          <div className="pt-2 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
            <div className="max-w-[260px] space-y-1">
              <p className="font-bold text-slate-700">Counter Pickup Instructions:</p>
              <p>1. No advance payment required online.</p>
              <p>2. Pay by Cash / UPI at the store billing desk.</p>
              <p>3. If medication requires Doctor's Rx, present original prescription.</p>
            </div>
            <div className="text-center font-mono">
              <div className="h-9 w-24 border-b border-slate-400 mx-auto flex items-end justify-center pb-1 text-[11px] text-slate-400 italic">
                Pharm. Verified
              </div>
              <p className="mt-1 text-[9px]">Dispensing Chemist Stamp</p>
            </div>
          </div>

          {/* Footer watermark */}
          <div className="text-center text-[10px] text-slate-400 font-mono pt-2">
            Generated via PharmaLocate MERN Platform • Token: {ticket.code}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">Ready for printing on any A4 or POS receipt printer</span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" /> Print Receipt Slip
            </button>
            <button
              onClick={onClose}
              className="border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
