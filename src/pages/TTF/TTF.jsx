

  import React, { useState, useEffect } from "react";
  import API from '../../CustomHooks/MasterApiHooks/api';

const TTF = ({ projectId, processId, lotNo, projectName, onClose }) => {
  // Location state
  const [locations, setLocations] = useState([]);

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await API.get('/Location');
        setLocations(res.data || []);
      } catch (err) {
        setLocations([]);
      }
    };
    fetchLocations();
  }, []);

  // Helper to get location name by id or fallback
  const getLocationName = (id) => {
    const loc = locations.find(l => l.locationId === id);
    return loc ? loc.locationName : (id === 1 ? 'Head Office' : id === 2 ? 'Factory' : 'Unknown');
  };
  // State for QC-verified catch list
  const [catchList, setCatchList] = useState([]);
  // UI state for search, filter, and selection
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);

  // Filtered items for table
  const filteredItems = catchList.filter(item => {
    const matchesSearch = (item.itemName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.itemCode?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "received" && item.received) ||
      (filterStatus === "pending" && !item.received);
    return matchesSearch && matchesStatus;
  });

  // Mark as received and update backend
  const markAsReceived = async (itemId) => {
    const item = catchList.find(i => i.id === itemId);
    if (!item) return;
    // Prepare payload based on API requirements
    const payload = {
      quantitySheetId: item.id,
      catchNo: item.catchNo,
      examDate: item.examDate || '',
      examTime: item.examTime || '',
      courseId: item.courseId || 0,
      subjectId: item.subjectId || 0,
      innerEnvelope: item.innerEnvelope || '',
      outerEnvelope: item.outerEnvelope || 0,
      lotNo: item.lotNo || '',
      quantity: item.quantity || 0,
      pages: item.pages || 0,
      percentageCatch: item.percentageCatch || 0,
      projectId: item.projectId || projectId || 0,
      status: item.status || 0,
      stopCatch: item.stopCatch || 0,
      processId: item.processId || [0],
      paperNumber: item.paperNumber || '',
      paperTitle: item.paperTitle || '',
      qpId: item.qpId || 0,
      maxMarks: item.maxMarks || 0,
      duration: item.duration || '',
      languageId: item.languageId || [0],
      examTypeId: item.examTypeId || 0,
      nepCode: item.nepCode || '',
      uniqueCode: item.uniqueCode || '',
      mssStatus: item.mssStatus || 0,
      ttfStatus: 1, // Mark as received in TTF
      structureOfPaper: item.structureOfPaper || '',
      ttfMarkAsReceived: 1
    };
    try {
      await API.put(`/api/QuantitySheet/${itemId}`, payload);
      setCatchList(prevList =>
        prevList.map(i => i.id === itemId ? { ...i, received: true } : i)
      );
    } catch (err) {
      // Optionally show error
      alert('Failed to mark as received');
    }
  };

  // Mark selected as received (batch)
  const markSelectedAsReceived = async () => {
    for (const itemId of selectedItems) {
      await markAsReceived(itemId);
    }
    setSelectedItems([]);
  };
  const selectAllItems = () => {
    const unreceivedItems = filteredItems.filter(item => !item.received).map(item => item.id);
    setSelectedItems(unreceivedItems);
  };
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  useEffect(() => {
    const fetchVerifiedQC = async () => {
      try {
        const response = await API.get(`/QC/ByProject?projectId=${projectId}`);
        const verified = (response.data || []).filter(item => item.verified?.status === true);
        const mapped = verified.map((item, idx) => ({
          id: item.quantitysheetId,
          catchNo: item.catchNo || '',
          paperTitle: item.paperTitle || '',
          language: Array.isArray(item.language) ? item.language.join(', ') : (item.language || ''),
          maxMarks: item.maxMarks || '',
          duration: item.duration || '',
          structureOfPaper: item.structureOfPaper || '',
          series: item.series || '',
          a: item.a || '',
          b: item.b || '',
          c: item.c || '',
          d: item.d || '',
          itemName: item.paperTitle || item.catchNo || `Catch ${idx+1}`,
          itemCode: item.catchNo || '',
          quantity: item.quantity || 0,
          fromLocation: item.fromLocationId || 1, // default to Head Office
          toLocation: item.toLocationId || 2, // default to Factory
          received: false,
          priority: 'High',
          remarks: '',
          transferRoute: `${getLocationName(item.fromLocationId || 1)} → ${getLocationName(item.toLocationId || 2)}`,
        }));
        setCatchList(mapped);
      } catch (err) {
        setCatchList([]);
      }
    };
    fetchVerifiedQC();
  }, [projectId]);

  // Check if all items are received
  const allItemsReceived = catchList.every(item => item.received);
  const receivedCount = catchList.filter(item => item.received).length;
  const progressPercentage = (receivedCount / catchList.length) * 100;

  // Handle transfer completion
  const handleTransferComplete = () => {
    if (allItemsReceived) {
      setTransferComplete(true);
      alert("✅ All items have been successfully transferred and received!");
    } else {
      alert("⚠️ Please mark all items as received before completing the transfer.");
    }
  };

  // Priority color mapping
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#fd7e14';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ 
      padding: 20, 
      maxWidth: 2000, 
      margin: "0 auto",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif"
    }}>
     

      {/* Filters and Search */}
      <div style={{ 
        backgroundColor: "white", 
        padding: 20, 
        borderRadius: 12, 
        marginBottom: 20,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", gap: 15, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <input
              type="text"
              placeholder="🔍 Search items or codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "10px 15px",
                border: "2px solid #e9ecef",
                borderRadius: 8,
                fontSize: 14,
                width: 250
              }}
            />
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "10px 15px",
                border: "2px solid #e9ecef",
                borderRadius: 8,
                fontSize: 14
              }}
            >
              <option value="all">All Items</option>
              <option value="pending">Pending Only</option>
              <option value="received">Received Only</option>
            </select>
          </div>

          {selectedItems.length > 0 && (
            <button
              onClick={markSelectedAsReceived}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Mark Selected as Received ({selectedItems.length})
            </button>
          )}

          <button
            onClick={selectAllItems}
            style={{
              padding: "10px 20px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Select All Pending
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: 12, 
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        marginBottom: 20
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1200px" }}>
            <thead>
              <tr style={{ backgroundColor: "#343a40", color: "white" }}>
                <th style={{ padding: 15, textAlign: "left", border: "1px solid #495057" }}>Select</th>
                <th style={{ padding: 15, textAlign: "left", border: "1px solid #495057" }}>Catch No</th>
                <th style={{ padding: 15, textAlign: "left", border: "1px solid #495057" }}>Paper Title</th>
                <th style={{ padding: 15, textAlign: "center", border: "1px solid #495057" }}>Language</th>
                <th style={{ padding: 15, textAlign: "center", border: "1px solid #495057" }}>Max Marks</th>
                <th style={{ padding: 15, textAlign: "center", border: "1px solid #495057" }}>Duration</th>
                <th style={{ padding: 15, textAlign: "center", border: "1px solid #495057" }}>Structure</th>
                <th style={{ padding: 15, textAlign: "center", border: "1px solid #495057" }}>Series</th>
                <th style={{ padding: 15, textAlign: "center", border: "1px solid #495057" }}>A</th>
                <th style={{ padding: 15, textAlign: "center", border: "1px solid #495057" }}>B</th>
                <th style={{ padding: 15, textAlign: "center", border: "1px solid #495057" }}>C</th>
                <th style={{ padding: 15, textAlign: "center", border: "1px solid #495057" }}>D</th>
                <th style={{ padding: 15, textAlign: "center", border: "1px solid #495057" }}>Quantity</th>
                <th style={{ padding: 15, textAlign: "left", border: "1px solid #495057" }}>Transfer Route</th>
               
                <th style={{ padding: 15, textAlign: "center", border: "1px solid #495057" }}>Status</th>
                <th style={{ padding: 15, textAlign: "center", border: "1px solid #495057" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id} style={{
                  backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                  opacity: item.received ? 0.8 : 1
                }}>
                  <td style={{ padding: 15, border: "1px solid #dee2e6", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      disabled={item.received}
                      style={{ transform: "scale(1.2)" }}
                    />
                  </td>
                  <td style={{ padding: 15, border: "1px solid #dee2e6" }}>{item.catchNo}</td>
                  <td style={{ padding: 15, border: "1px solid #dee2e6" }}>{item.paperTitle}</td>
                  <td style={{ padding: 15, border: "1px solid #dee2e6", textAlign: "center" }}>{item.language}</td>
                  <td style={{ padding: 15, border: "1px solid #dee2e6", textAlign: "center" }}>{item.maxMarks}</td>
                  <td style={{ padding: 15, border: "1px solid #dee2e6", textAlign: "center" }}>{item.duration}</td>
                  <td style={{ padding: 15, border: "1px solid #dee2e6", textAlign: "center" }}>{item.structureOfPaper}</td>
                  <td style={{ padding: 15, border: "1px solid #dee2e6", textAlign: "center" }}>{item.series}</td>
                  <td style={{ padding: 15, border: "1px solid #dee2e6", textAlign: "center" }}>{item.a}</td>
                  <td style={{ padding: 15, border: "1px solid #dee2e6", textAlign: "center" }}>{item.b}</td>
                  <td style={{ padding: 15, border: "1px solid #dee2e6", textAlign: "center" }}>{item.c}</td>
                  <td style={{ padding: 15, border: "1px solid #dee2e6", textAlign: "center" }}>{item.d}</td>
                  <td style={{ padding: 15, textAlign: "center", border: "1px solid #dee2e6", fontSize: 16, fontWeight: "bold" }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: 15, border: "1px solid #dee2e6" }}>
                    <div style={{ fontSize: 13 }}>
                      <div style={{ color: "#dc3545", marginBottom: 2 }}>📍 From: {getLocationName(item.fromLocation)}</div>
                      <div style={{ color: "#28a745" }}>📍 To: {getLocationName(item.toLocation)}</div>
                     
                    </div>
                  </td>
                 
                  <td style={{ padding: 15, textAlign: "center", border: "1px solid #dee2e6" }}>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: "bold",
                     
                      color: item.received ? "#155724" : "#856404"
                    }}>
                      {item.received ? "✅ Received" : "Pending"}
                    </span>
                  </td>
                  <td style={{ padding: 15, textAlign: "center", border: "1px solid #dee2e6" }}>
                    <button
                      onClick={() => markAsReceived(item.id)}
                      disabled={item.received}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: item.received ? "#6c757d" : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: item.received ? "not-allowed" : "pointer",
                        fontSize: 12,
                        fontWeight: "bold",
                        transition: "all 0.3s ease"
                      }}
                    >
                      {item.received ? "Received" : "Mark Received"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        gap: 15,
        flexWrap: "wrap"
      }}>
        

       
      </div>
    </div>
  );
};

export default TTF;