import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [invoices, setInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const [uploadFile, setUploadFile] = useState(null);
  const [newClient, setNewClient] = useState('');
  const [newAmount, setNewAmount] = useState('');
  // 1. New Currency State
  const [currency, setCurrency] = useState('USD'); 
  const [dueDate, setDueDate] = useState('');
  const [terms, setTerms] = useState('Net 30');

  const inputRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/invoices')
      .then(res => res.json())
      .then(data => setInvoices(data))
      .catch(err => console.error("Error fetching data:", err));
  }, []);

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

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0].name);
    }
  };

  const onBoxClick = () => {
    inputRef.current.click();
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault(); 
    
    // 2. Include currency in the data sent to MongoDB
    const newInvoice = {
      client: newClient || 'Parsed from Document',
      amount: parseInt(newAmount) || 0,
      currency: currency, 
      status: 'on_track',
      due: dueDate || '2026-09-01',
      stage: 'Stage 0: Awaiting Payment'
    };

    try {
      const response = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInvoice),
      });

      const savedInvoice = await response.json();
      setInvoices([...invoices, savedInvoice]); 
      setIsModalOpen(false); 
      setNewClient(''); 
      setNewAmount('');
      setCurrency('USD'); // Reset currency to default
      setDueDate('');
      setTerms('Net 30');
      setUploadFile(null);
    } catch (err) {
      console.error("Error saving invoice:", err);
      alert("Failed to save invoice to database.");
    }
  };

  // 3. Helper function to turn currency codes into symbols
  const getSymbol = (code) => {
    switch(code) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  const renderContent = () => {
    if (activeTab === 'Dashboard') {
      let totalOutstanding = 0;
      let cashAtRisk = 0;
      let collected = 0;

      invoices.forEach(inv => {
        if (inv.status === 'on_track') {
          totalOutstanding += inv.amount;
        } else if (inv.status === 'overdue') {
          totalOutstanding += inv.amount;
          cashAtRisk += inv.amount;
        } else if (inv.status === 'paid') {
          collected += inv.amount;
        }
      });

      return (
        <>
          <section className="stats-ribbon">
            <div className="stat-card">
              <span className="stat-title">Total Outstanding</span>
              <h3 className="stat-value">${totalOutstanding.toLocaleString()}</h3>
            </div>
            <div className="stat-card danger">
              <span className="stat-title">Cash at Risk (Overdue)</span>
              <h3 className="stat-value">${cashAtRisk.toLocaleString()}</h3>
            </div>
            <div className="stat-card success">
              <span className="stat-title">Collected (30 Days)</span>
              <h3 className="stat-value">${collected.toLocaleString()}</h3>
            </div>
          </section>

          <section className="invoice-section">
            <h2>Active Collections Escalation</h2>
            {invoices.length === 0 ? (
              <p style={{ color: '#64748b' }}>No invoices in the database yet. Create one!</p>
            ) : (
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
                      {/* 4. Display the correct symbol for each invoice */}
                      <span className="invoice-amount">{getSymbol(inv.currency)}{inv.amount.toLocaleString()}</span>
                      <span className={`status-badge ${inv.status}`}>
                        {inv.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              
              {/* 5. The New Currency + Amount Dropdown Layout */}
              <div className="form-group">
                <label>Amount</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select style={{ width: '35%' }} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                  <input style={{ width: '65%' }} type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="5000" />
                </div>
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
