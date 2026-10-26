import React from 'react';
import { Printer, CheckCircle, ShieldCheck, MapPin, Phone, Clock, AlertTriangle, X, QrCode } from 'lucide-react';

export default function PharmacyReceiptModal({ ticket, onClose }) {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative my-8 animate-in fade-in duration-200">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Official Pharmacy Hold Receipt Slip
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow"
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
              {ticket.pharmacy || 'Apollo Pharmacy (24x7)'}
            </h2>
            <p className="text-xs text-slate-600 font-medium">{ticket.address || '12 Main Road, Commercial Enclave'}</p>
            <p className="text-[11px] text-slate-500 font-mono">
              📞 {ticket.phone || '+91 98401 23456'} • DL No: DL-20B/48921/24 • GSTIN: 33AAACR2948P1Z8
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
                    ₹{(ticket.price || 45.00).toFixed(2)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <tr>
                  <td colSpan="2" className="p-2.5 text-right text-xs uppercase">Total Payable at Counter:</td>
                  <td className="p-2.5 text-right text-sm text-emerald-800 font-black">
                    ₹{(ticket.price || 45.00).toFixed(2)}
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

        {/* Modal Bottom Actions (Hidden during print) */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center print:hidden">
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
