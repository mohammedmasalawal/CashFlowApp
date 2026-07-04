import { useState, useRef } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  const [invoices, setInvoices] = useState([
    { _id: '1', client: 'Vodafone', amount: 10000, status: 'overdue', due: '2026-06-15', stage: 'Stage 3: Late Fee Applied' },
    { _id: '2', client: 'TruShot5 B2B', amount: 22500, status: 'overdue', due: '2026-06-25', stage: 'Stage 1: Auto-Reminder Sent' },
    { _id: '3', client: 'City Government', amount: 45000, status: 'on_track', due: '2026-08-01', stage: 'Stage 0: Awaiting Payment' },
    { _id: '4', client: 'AwesomeOrca Mfg', amount: 8400, status: 'paid', due: '2026-07-01', stage: 'Resolved' },
    { _id: '5', client: '3r3r', amount: 222, status: 'on_track', due: '2026-09-01', stage: 'Stage 0: Awaiting Payment' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const [uploadFile, setUploadFile] = useState(null);
  const [newClient, setNewClient] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [terms, setTerms] = useState('Net 30');

  // 1. Added a ref to control the hidden file input
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0].name);
    }
  };

  // 2. Function to handle manual file selection
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0].name);
    }
  };

  // 3. Function to trigger the hidden input when the box is clicked
  const onBoxClick = () => {
    inputRef.current.click();
  };

  const handleAddInvoice = (e) => {
    e.preventDefault(); 
    
    const newInvoice = {
      _id: Math.random().toString(),
      client: newClient || 'Parsed from Document',
      amount: parseInt(newAmount) || 0,
      status: 'on_track',
      due: dueDate || '2026-09-01',
      stage: 'Stage 0: Awaiting Payment'
    };

    setInvoices([...invoices, newInvoice]); 
    setIsModalOpen(false); 
    
    setNewClient(''); 
    setNewAmount('');
    setDueDate('');
    setTerms('Net 30');
    setUploadFile(null);
  };

  const renderContent = () => {
    if (activeTab === 'Dashboard') {
      return (
        <>
          <section className="stats-ribbon">
            <div className="stat-card">
              <span className="stat-title">Total Outstanding</span>
              <h3 className="stat-value">$85,900</h3>
            </div>
            <div className="stat-card danger">
              <span className="stat-title">Cash at Risk (Overdue)</span>
              <h3 className="stat-value">$32,500</h3>
            </div>
            <div className="stat-card success">
              <span className="stat-title">Collected (30 Days)</span>
              <h3 className="stat-value">$8,400</h3>
            </div>
          </section>

          <section className="invoice-section">
            <h2>Active Collections Escalation</h2>
            <div className="invoice-list">
              {invoices.map(inv => (
                <div key={inv._id} className={`invoice-card ${inv.status}`}>
                  <div className="card-left">
                    <strong>{inv.client}</strong>
                    <span className="due-date">Due: {inv.due}</span>
                  </div>
                  
                  <div className="card-center">
                    <span className="automation-stage">🤖 {inv.stage}</span>
                  </div>

                  <div className="card-right">
                    <span className="invoice-amount">${inv.amount.toLocaleString()}</span>
                    <span className={`status-badge ${inv.status}`}>
                      {inv.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      );
    }

    return (
      <div className="placeholder-module">
        <h2>{activeTab} Module</h2>
        <p>This feature is currently in private beta. It will be unlocked in Phase 2 of the rollout.</p>
      </div>
    );
  };

  return (
    <div className="app-layout">
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <h2>Add Invoice to Ledger</h2>
            
            {/* 4. Added onClick to the drop zone and the hidden input element */}
            <div 
              className={`drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={onBoxClick}
            >
              <input 
                ref={inputRef} 
                type="file" 
                style={{ display: "none" }} 
                onChange={handleChange} 
                accept=".pdf,.csv,.jpg,.png" 
              />
              <div className="drop-icon">📄</div>
              {uploadFile ? (
                <p className="file-success">Attached: <strong>{uploadFile}</strong></p>
              ) : (
                <p>Drag & drop invoice PDF here, or <span>browse files</span></p>
              )}
              <small>Ledger AI will automatically parse client details and amounts.</small>
            </div>

            <div className="divider"><span>OR ENTER MANUALLY</span></div>

            <form onSubmit={handleAddInvoice} className="grid-form">
              <div className="form-group full-width">
                <label>Client Name</label>
                <input type="text" value={newClient} onChange={(e) => setNewClient(e.target.value)} placeholder="e.g., Acme Corp" />
              </div>
              <div className="form-group">
                <label>Amount ($)</label>
                <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="5000" />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="form-group full-width">
                <label>Payment Terms</label>
                <select value={terms} onChange={(e) => setTerms(e.target.value)}>
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
              <div className="modal-actions full-width">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Process Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <nav className="sidebar">
        <div className="brand">
          <div className="logo-box">LC</div>
          <h2>Ledger Copilot</h2>
        </div>
        
        <ul className="nav-links">
          {['Dashboard', 'Invoices', 'Automations', 'Clients'].map(tab => (
            <li 
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Dashboard' ? '📊 ' : tab === 'Invoices' ? '📄 ' : tab === 'Automations' ? '⚙️ ' : '👥 '} 
              {tab}
            </li>
          ))}
        </ul>

        <div className="sidebar-bottom">
          <div className="user-profile">YK</div>
        </div>
      </nav>

      <main className="main-content">
        <header className="top-header">
          <h1>Command Center</h1>
          <button className="primary-btn" onClick={() => setIsModalOpen(true)}>+ New Invoice</button>
        </header>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;