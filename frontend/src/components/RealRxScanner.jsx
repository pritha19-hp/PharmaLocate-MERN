import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Pill, Search, 
  RefreshCw, Image as ImageIcon, Zap, Edit3, Plus, ArrowRight, ShieldCheck 
} from 'lucide-react';
import Tesseract from 'tesseract.js';

// Comprehensive dictionary of common prescription medicines, antibiotics, analgesics, etc.
const KNOWN_MEDICINES = [
  { name: 'Augmentin 625 Duo', salt: 'Amoxicillin + Clavulanic Acid', category: 'Antibiotics', keywords: ['augmentin', 'amoxicillin', 'clavulanic', 'clav', '625'] },
  { name: 'Dolo 650', salt: 'Paracetamol 650mg', category: 'Fever & Pain', keywords: ['dolo', 'paracetamol', '650', 'dolo650', 'pcm'] },
  { name: 'InsuQuick 100IU', salt: 'Insulin Glargine Human', category: 'Diabetes', keywords: ['insuquick', 'insulin', 'glargine', '100iu'] },
  { name: 'Azithral 500', salt: 'Azithromycin 500mg', category: 'Antibiotics', keywords: ['azithral', 'azithromycin', 'azithro', '500'] },
  { name: 'Glycomet GP 1', salt: 'Metformin + Glimepiride', category: 'Diabetes', keywords: ['glycomet', 'metformin', 'glimepiride'] },
  { name: 'Pantocid 40', salt: 'Pantoprazole Gastro-Resistant', category: 'Gastro', keywords: ['pantocid', 'pantoprazole', 'panto', '40mg'] },
  { name: 'Okacet 10mg', salt: 'Cetirizine Dihydrochloride', category: 'Allergy', keywords: ['okacet', 'cetirizine', 'cetzine', '10mg'] },
  { name: 'Combiflam', salt: 'Ibuprofen + Paracetamol', category: 'Fever & Pain', keywords: ['combiflam', 'ibuprofen', 'flam'] },
  { name: 'Telma 40', salt: 'Telmisartan 40mg', category: 'Blood Pressure', keywords: ['telma', 'telmisartan', 'telmi'] },
  { name: 'Montair LC', salt: 'Montelukast + Levocetirizine', category: 'Respiratory', keywords: ['montair', 'montelukast', 'levocetirizine'] },
  { name: 'Ciplox 500', salt: 'Ciprofloxacin 500mg', category: 'Antibiotics', keywords: ['ciplox', 'ciprofloxacin', 'cipro'] },
  { name: 'Atorva 10', salt: 'Atorvastatin 10mg', category: 'Cholesterol', keywords: ['atorva', 'atorvastatin', 'statin'] }
];

export default function RealRxScanner({ onSelectMedicine, masterInventory = [] }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [extractedRawText, setExtractedRawText] = useState('');
  const [detectedMedicines, setDetectedMedicines] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [manualMedInput, setManualMedInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Handle local user file upload (PNG, JPG, JPEG, WEBP)
  const handleFileUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, or WEBP).');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    setExtractedRawText('');
    setDetectedMedicines([]);
    setHasScanned(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Generate a realistic prescription slip on HTML Canvas for 1-click test
  const handleLoadSampleRx = (sampleType = 'antibiotic') => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 650;
    const ctx = canvas.getContext('2d');

    // Background paper
    ctx.fillStyle = '#fbfcf8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header border
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 760, 610);

    // Clinic Header
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('CITY CARE MULTISPECIALITY CLINIC', 50, 65);
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.fillText('Dr. Anand Sharma, MD (Internal Medicine), MBBS (Reg No: 48921)', 50, 90);
    ctx.fillText('142 Health Avenue, Medical Enclave • Phone: +91 98401 22334', 50, 110);

    // Separator line
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 125);
    ctx.lineTo(760, 125);
    ctx.stroke();

    // Patient Details
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.fillText('PATIENT: Rahul Sharma (Male, 32 Yrs)', 50, 150);
    ctx.fillText(`DATE: ${new Date().toLocaleDateString('en-GB')}`, 550, 150);
    ctx.fillText('DIAGNOSIS: Acute Upper Respiratory Tract Infection & High Fever', 50, 175);

    // Rx Symbol
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillStyle = '#059669';
    ctx.fillText('℞', 50, 235);

    // Prescription Items
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillStyle = '#111827';

    if (sampleType === 'antibiotic') {
      ctx.fillText('1. Tab. Augmentin 625 Duo (Amoxicillin + Clav)', 80, 280);
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = '#4b5563';
      ctx.fillText('   Dosage: 1 Tablet - Twice Daily (After Food) x 5 Days', 80, 305);

      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillStyle = '#111827';
      ctx.fillText('2. Tab. Dolo 650 (Paracetamol 650mg)', 80, 350);
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = '#4b5563';
      ctx.fillText('   Dosage: 1 Tablet - SOS (When fever > 100°F)', 80, 375);

      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillStyle = '#111827';
      ctx.fillText('3. Cap. Pantocid 40 (Pantoprazole 40mg)', 80, 420);
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = '#4b5563';
      ctx.fillText('   Dosage: 1 Capsule - Morning Empty Stomach x 5 Days', 80, 445);
    } else {
      ctx.fillText('1. Tab. Azithral 500 (Azithromycin 500mg)', 80, 280);
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = '#4b5563';
      ctx.fillText('   Dosage: 1 Tablet - Once Daily x 3 Days', 80, 305);

      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillStyle = '#111827';
      ctx.fillText('2. Tab. Montair LC (Montelukast + Levocetirizine)', 80, 350);
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = '#4b5563';
      ctx.fillText('   Dosage: 1 Tablet at bedtime x 7 Days', 80, 375);

      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillStyle = '#111827';
      ctx.fillText('3. Tab. Dolo 650 (Paracetamol 650mg)', 80, 420);
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = '#4b5563';
      ctx.fillText('   Dosage: 1 Tablet - SOS for Bodyache', 80, 445);
    }

    // Signature
    ctx.font = 'italic 16px "Brush Script MT", cursive, Georgia';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText('Dr. Anand Sharma', 560, 560);
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Authorised Signature & Stamp', 540, 580);

    const generatedUrl = canvas.toDataURL('image/png');
    setImageSrc(generatedUrl);
    setFileName(`Dr_Anand_Rx_${sampleType}.png`);
    setFileSize('184 KB');
    setExtractedRawText('');
    setDetectedMedicines([]);
    setHasScanned(false);
  };

  // Run real Tesseract OCR on the current image
  const runRealOCR = async () => {
    if (!imageSrc) return;

    setIsProcessing(true);
    setProgressPercent(0);
    setProgressStatus('Initializing Tesseract OCR Neural Engine...');
    setExtractedRawText('');
    setDetectedMedicines([]);

    try {
      const result = await Tesseract.recognize(
        imageSrc,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'loading tesseract core') {
              setProgressStatus('Loading OCR Core WASM...');
              setProgressPercent(15);
            } else if (m.status === 'initializing tesseract') {
              setProgressStatus('Loading English Linguistic Model...');
              setProgressPercent(30);
            } else if (m.status === 'recognizing text') {
              const pct = Math.min(95, Math.round(30 + (m.progress || 0) * 65));
              setProgressStatus(`Scanning handwriting & characters: ${pct}%`);
              setProgressPercent(pct);
            }
          }
        }
      );

      const rawText = result?.data?.text || '';
      setExtractedRawText(rawText);
      setProgressPercent(100);
      setProgressStatus('Processing medicine entity matching...');

      // Parse detected medicines from raw OCR output
      const lowerText = rawText.toLowerCase();
      const detected = [];

      // Check against our rich medicine database
      KNOWN_MEDICINES.forEach((med) => {
        const isMatched = med.keywords.some((kw) => lowerText.includes(kw.toLowerCase()));
        if (isMatched && !detected.some(d => d.name === med.name)) {
          // Check if this medicine exists in local inventory
          const inInventory = masterInventory.some(
            inv => inv.medicine_name.toLowerCase().includes(med.name.toLowerCase()) ||
                   med.keywords.some(k => inv.generic_name.toLowerCase().includes(k))
          );

          detected.push({
            name: med.name,
            salt: med.salt,
            category: med.category,
            confidence: Math.round(result.data.confidence || 88),
            inInventory
          });
        }
      });

      // Also check if any inventory medicine name directly appears in OCR text
      masterInventory.forEach((inv) => {
        const parts = inv.medicine_name.toLowerCase().split(' ');
        const matchesPrimary = parts.some(p => p.length > 3 && lowerText.includes(p));
        if (matchesPrimary && !detected.some(d => d.name.toLowerCase() === inv.medicine_name.toLowerCase())) {
          detected.push({
            name: inv.medicine_name,
            salt: inv.generic_name,
            category: inv.category,
            confidence: 85,
            inInventory: true
          });
        }
      });

      setDetectedMedicines(detected);
      setHasScanned(true);
    } catch (err) {
      console.error('OCR Error:', err);
      alert('OCR Scanning encountered an issue. Please ensure the image is clear.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add medicine manually
  const handleAddManualMed = () => {
    if (!manualMedInput.trim()) return;
    const name = manualMedInput.trim();
    if (!detectedMedicines.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      setDetectedMedicines(prev => [
        ...prev, 
        { name, salt: 'User Specified Medicine', category: 'Custom', confidence: 100, inInventory: true }
      ]);
    }
    setManualMedInput('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
      {/* Title & Description */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-emerald-600" /> Real-Time OCR Optical Engine
          </span>
          <span className="text-xs font-semibold text-slate-400">Powered by Tesseract Neural Vision</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
          Doctor Prescription AI Scanner 📸
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Upload any handwritten or printed doctor slip from your device. Real OCR processes the image live, extracts medicine names and active salts, and checks live local pharmacy inventory instantly.
        </p>
      </div>

      {/* Upload & Drag Drop Zone */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-6 md:p-8 text-center transition ${
          isDragOver 
            ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]' 
            : 'border-slate-300 bg-slate-50 hover:bg-slate-50/80 hover:border-emerald-400'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="bg-emerald-600 text-white p-3.5 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center shadow-md">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-800 text-base">
              Drag & Drop Your Doctor's Prescription Here
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Supports PNG, JPG, JPEG, WEBP photos from your phone or PC
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow flex items-center gap-2"
            >
              <Upload className="h-4 w-4" /> Choose File from Computer
            </button>
            <button
              onClick={() => handleLoadSampleRx('antibiotic')}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-600" /> Test Sample Rx 1 (Augmentin)
            </button>
            <button
              onClick={() => handleLoadSampleRx('cold')}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-blue-600" /> Test Sample Rx 2 (Azithral)
            </button>
          </div>
        </div>
      </div>

      {/* Selected Image Preview & Scan Action */}
      {imageSrc && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{fileName || 'Prescription Image'}</h4>
                <p className="text-xs text-slate-500">File Size: {fileSize || 'Ready for OCR processing'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                disabled={isProcessing}
                onClick={runRealOCR}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Scanning Image...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" /> Run Live OCR Scanner
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setImageSrc(null);
                  setExtractedRawText('');
                  setDetectedMedicines([]);
                  setHasScanned(false);
                }}
                className="border border-slate-300 hover:bg-slate-200 text-slate-600 font-bold text-xs px-3 py-2.5 rounded-xl transition"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Image Canvas Preview */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-1/2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-slate-100 px-4 py-2 text-[11px] font-bold text-slate-600 flex justify-between items-center border-b border-slate-200">
                <span>Doctor Prescription Slip Preview</span>
                <span className="text-emerald-700 font-mono">100% Client-Side OCR</span>
              </div>
              <div className="p-2 max-h-80 overflow-y-auto flex justify-center bg-slate-900/5">
                <img 
                  src={imageSrc} 
                  alt="Doctor Prescription" 
                  className="max-h-72 w-auto object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>

            {/* OCR Progress & Live Extracted Text */}
            <div className="w-full lg:w-1/2 space-y-4">
              {isProcessing && (
                <div className="bg-white rounded-2xl p-5 border border-emerald-300 shadow-sm space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-emerald-600 animate-spin" />
                      {progressStatus}
                    </span>
                    <span className="font-mono">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-3 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Recognizing handwriting characters, active salt names, and dosage lines...
                  </p>
                </div>
              )}

              {/* Raw OCR Text output */}
              {extractedRawText && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      Raw OCR Recognized Text:
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                      {extractedRawText.length} characters
                    </span>
                  </div>
                  <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                    {extractedRawText}
                  </div>
                </div>
              )}

              {!isProcessing && !extractedRawText && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-slate-500 space-y-2">
                  <Zap className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">Ready to Scan</p>
                  <p className="text-xs text-slate-500">
                    Click the <strong>"Run Live OCR Scanner"</strong> button above to parse this prescription with Tesseract.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Section: Detected Medicines */}
      {hasScanned && (
        <div className="bg-white border-2 border-emerald-400 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Detected Medicines & Generic Salts ({detectedMedicines.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any medicine below to immediately search nearby pharmacy inventory.
              </p>
            </div>

            {/* Quick manual medicine addition */}
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Doctor's handwriting missed one? Type name..."
                value={manualMedInput}
                onChange={(e) => setManualMedInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddManualMed(); }}
                className="bg-slate-50 border border-slate-300 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
              />
              <button
                onClick={handleAddManualMed}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>

          {detectedMedicines.length === 0 ? (
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-amber-600 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No specific drug matches detected</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Doctor handwriting might be cursive or low-contrast. Use the input box above to type the medicine name manually and check stock.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {detectedMedicines.map((med, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-400 rounded-2xl p-4 transition flex flex-col justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                        {med.category || 'Medicine'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {med.confidence}% Match
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-base">{med.name}</h4>
                    <p className="text-xs text-slate-500">Salt: <span className="font-semibold text-slate-700">{med.salt}</span></p>
                  </div>

                  <button
                    onClick={() => onSelectMedicine(med.name)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Search className="h-3.5 w-3.5" /> Search Local Stock <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
