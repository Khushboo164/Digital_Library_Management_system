import React from 'react';
import ReactDOM from 'react-dom';
import { FaFileInvoiceDollar, FaTimes, FaDownload, FaPrint } from 'react-icons/fa';

const ReceiptModal = ({ receiptData, onClose }) => {
  if (!receiptData) return null;

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(30, 27, 75, 0.35)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
      padding: '2rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white', width: '100%', maxWidth: '420px', borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out', display: 'flex', flexDirection: 'column',
        maxHeight: '100%'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', padding: '2rem 1.5rem 1.5rem', textAlign: 'center', color: 'white', position: 'relative', flexShrink: 0 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.2)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
            <FaTimes />
          </button>
          <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#0ea5e9', fontSize: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <FaFileInvoiceDollar />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Payment Receipt</h2>
          <p style={{ margin: '0.5rem 0 0', opacity: 0.9, fontSize: '0.9rem' }}>{receiptData.status === 'Refunded' ? 'Refund Processed Successfully' : 'Payment Completed Successfully'}</p>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem 2rem 0.5rem', background: '#f8fafc', overflowY: 'auto', flex: 1, minHeight: 0 }}>
           <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Amount</div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                ₹{receiptData.amount}
              </div>
           </div>

           <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', position: 'relative' }}>
             {/* Receipt jagged edge effect */}
             <div style={{ position: 'absolute', top: '-6px', left: 0, right: 0, height: '6px', background: 'radial-gradient(circle, transparent, transparent 4px, white 4px, white 6px, transparent 6px), radial-gradient(circle, transparent, transparent 4px, white 4px, white 6px, transparent 6px)', backgroundSize: '12px 12px', backgroundPosition: '0 0, 6px 6px', zIndex: 1 }}></div>

             <DetailRow label="Transaction ID" value={`TXN-${(receiptData.id || '').slice(-8).toUpperCase()}`} />
             <DetailRow label="Date" value={receiptData.date ? new Date(receiptData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} />
             <DetailRow label="Time" value={receiptData.date ? new Date(receiptData.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'} />
             <div style={{ height: '1px', borderTop: '1px dashed #cbd5e1', margin: '1rem 0' }}></div>
             <DetailRow label="Type" value={receiptData.type} />
             <DetailRow label="Book" value={receiptData.bookTitle || 'Unknown'} bold />
             {receiptData.memberName && (
               <DetailRow label="Member" value={receiptData.memberName} />
             )}
             <DetailRow label="Status" value={
                <span style={{ color: receiptData.status === 'Refunded' ? '#0ea5e9' : '#10b981', fontWeight: 800 }}>{receiptData.status.toUpperCase()}</span>
             } />
           </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1.5rem 2rem 2rem', background: '#f8fafc', display: 'flex', gap: '1rem', flexShrink: 0, borderTop: '1px solid #e2e8f0' }}>
          <button onClick={() => window.print()} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
            <FaPrint /> Print
          </button>
          <button onClick={() => alert('Downloading receipt PDF...')} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', border: 'none', background: '#0f172a', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <FaDownload /> Download
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const DetailRow = ({ label, value, bold }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{label}</span>
    <span style={{ color: '#0f172a', fontWeight: bold ? 700 : 500, fontSize: '0.9rem', textAlign: 'right', maxWidth: '65%' }}>{value}</span>
  </div>
);

export default ReceiptModal;
