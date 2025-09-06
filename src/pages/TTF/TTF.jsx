

  import React, { useState, useEffect } from "react";
import API from '../../CustomHooks/MasterApiHooks/api';
import './TTF.css';

const TTF = ({ projectId, processId, lotNo, projectName, onClose }) => {
  // Location state
  const [locations, setLocations] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch locations on mount and store in localStorage
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Try to get from localStorage first
        const cachedLocations = localStorage.getItem('ttf_locations');
        if (cachedLocations) {
          setLocations(JSON.parse(cachedLocations));
        }
        
        // Fetch fresh data
        const res = await API.get('/Location');
        const locationData = res.data || [];
        setLocations(locationData);
        
        // Update cache
        localStorage.setItem('ttf_locations', JSON.stringify(locationData));
      } catch (err) {
        console.error('Error fetching locations:', err);
        const cachedLocations = localStorage.getItem('ttf_locations');
        if (cachedLocations) {
          setLocations(JSON.parse(cachedLocations));
        } else {
          setLocations([]);
        }
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

  // Filtered items for table - always show verified items
  const filteredItems = catchList.filter(item => {
    
    // Search filter
    const matchesSearch = searchTerm === '' || (
      (item.itemName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.itemCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.catchNo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    // Status filter
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "received" && item.received) ||
      (filterStatus === "pending" && !item.received);

    const shouldShow = matchesSearch && matchesStatus;
    return shouldShow;
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Update total pages when filtered items change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredItems.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [filteredItems.length, itemsPerPage]);

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Note: Do not cache received status locally; always rely on server state

  // Mark as received and update backend
  const markAsReceived = async (itemId) => {
    try {
      // First get the current state of the item to ensure we have latest data
      const currentState = await API.get(`/QuantitySheet/${itemId}`);
      let currentData = Array.isArray(currentState.data) ? currentState.data[0] : currentState.data;
      
      if (!currentData) {
        throw new Error('No data found for this item');
      }

      // Create base payload from current data
      const payload = { ...currentData };
      
      // Ensure required fields and proper types
      payload.quantitySheetId = parseInt(itemId);
      payload.ttfStatus = 1;
      payload.ttfMarkAsReceived = 1; // Explicitly set this field
      
      // Convert all number fields to integers
      const numberFields = [
        'courseId', 'subjectId', 'outerEnvelope', 'quantity',
        'pages', 'percentageCatch', 'projectId', 'status',
        'stopCatch', 'qpId', 'maxMarks', 'examTypeId', 'mssStatus'
      ];
      
      numberFields.forEach(field => {
        payload[field] = parseInt(payload[field] || '0') || 0;
      });

      // Ensure arrays are properly formatted
      payload.processId = Array.isArray(payload.processId) ? payload.processId : [0];
      payload.languageId = Array.isArray(payload.languageId) 
        ? payload.languageId.map(id => parseInt(id)) 
        : [0];

      // Ensure string fields have default values
      const stringFields = [
        'catchNo', 'examDate', 'examTime', 'innerEnvelope',
        'lotNo', 'paperNumber', 'paperTitle', 'duration',
        'nepCode', 'uniqueCode', 'structureOfPaper'
      ];
      
      stringFields.forEach(field => {
        payload[field] = payload[field] || "";
      });



      // Update the item using the correct endpoint with retries
      let retryCount = 0;
      let updateSuccess = false;
      
      // Function to verify the update
      const verifyUpdate = async () => {
        try {
          // Wait a short moment to ensure database consistency
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Fetch the latest data
          const verifyResponse = await API.get(`/QuantitySheet/${itemId}`);
          const verifiedData = Array.isArray(verifyResponse.data) ? verifyResponse.data[0] : verifyResponse.data;
          
          // Check both ttfMarkAsReceived and ttfStatus
          if (verifiedData?.ttfMarkAsReceived === 1) {
            return true;
          } else {
            return false;
          }
        } catch (verifyErr) {
          return false;
        }
      };

      while (retryCount < 3 && !updateSuccess) {
        try {          
          // Make the update request
          const response = await API.put(`/QuantitySheet/update/${itemId}`, payload);
          
          if (response.status === 200 || response.status === 204) {
            // Verify the update
            if (await verifyUpdate()) {
              updateSuccess = true;
              
              // Only update local state after successful database update
              setCatchList(prevList =>
                prevList.map(i => i.id === itemId ? { 
                  ...i, 
                  received: true,
                  ttfStatus: 1,
                  ttfMarkAsReceived: 1
                } : i)
              );
              break;
            } else {
              console.warn(`Update verification failed on attempt ${retryCount + 1}`);
              // If verification fails, wait longer before next attempt
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } else {
            console.warn(`Update request failed with status: ${response.status}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (updateErr) {
          console.error(`Error on update attempt ${retryCount + 1}:`, updateErr);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
        retryCount++;
      }

    } catch (err) {
      alert('Failed to mark as received. Please try again.');
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
          // Get QC verified items
          const qcResponse = await API.get(`/QC/ByProject?projectId=${projectId}`);        // Include all items that have been verified in QC
        const verified = (qcResponse.data || []).filter(item => {
          const isVerified = item.verified?.status === true;
          return isVerified;
        });

        // Get status for each verified item individually
        const statusPromises = verified.map(item => 
          API.get(`/QuantitySheet/${item.quantitysheetId}`)
            .then(response => ({
              quantitySheetId: item.quantitysheetId,
              data: Array.isArray(response.data) ? response.data[0] : response.data
            }))
            .catch(() => ({
              quantitySheetId: item.quantitysheetId,
              data: null
            }))
        );

        const quantitySheetResults = await Promise.all(statusPromises);
        const quantitySheets = quantitySheetResults
          .filter(result => result.data)
          .map(result => result.data);
        
        const mapped = verified.map((item, idx) => {
          
          // Find matching quantity sheet for this item
          const qsData = quantitySheets.find(qs => qs.quantitySheetId === item.quantitysheetId);

          // Check received status only from QS data (no local cache)
          const isReceived = qsData ?
            (qsData.ttfMarkAsReceived === 1 || qsData.ttfStatus === 1) :
            false;

          // Create item for display - use QC data as base, supplement with QS data
          return {
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
            quantity: qsData?.quantity || item.quantity || 0,
            fromLocation: item.fromLocationId || 1,
            toLocation: item.toLocationId || 2,
            received: isReceived,
            ttfStatus: qsData?.ttfStatus || 0,
            ttfMarkAsReceived: qsData?.ttfMarkAsReceived || 0,
            priority: 'High',
            remarks: '',
            transferRoute: `${getLocationName(item.fromLocationId || 1)} → ${getLocationName(item.toLocationId || 2)}`,
            verified: true
          };
          
          
        });
        
        // Keep pending items first but don't hide received items
        const sortedMapped = [...mapped].sort((a, b) => {
          if (a.received === b.received) {
            // If received status is the same, sort by catchNo
            return (a.catchNo || '').localeCompare(b.catchNo || '');
          }
          return a.received ? 1 : -1;
        });
        
        // Update the state with the sorted items
        setCatchList(sortedMapped);
      } catch (err) {
        // Don't clear the list on error, keep existing data
        return;
      }
    };
    
    // Only fetch if we have a valid projectId
    if (projectId) {
      console.log('Starting fetch for project:', projectId);
      fetchVerifiedQC();
    } else {
      console.log('No projectId provided');
    }
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
    <div className="ttf-container">
      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filters-container">
          <div>
            <input
              type="text"
              placeholder="🔍 Search Catch No...."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Items</option>
              <option value="pending">Pending Only</option>
              <option value="received">Received Only</option>
            </select>
          </div>

          {selectedItems.length > 0 && (
            <button
              onClick={markSelectedAsReceived}
              className="action-button button-green"
            >
              Mark Selected as Received ({selectedItems.length})
            </button>
          )}

          
        </div>
      </div>

      {/* Items Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="ttf-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Catch No</th>
                <th>Paper Title</th>
                <th>Language</th>
                <th>Max Marks</th>
                <th>Duration</th>
                <th>Structure</th>
                
                <th>A</th>
                <th>B</th>
                <th>C</th>
                <th>D</th>
                <th>Quantity</th>
                <th>Transfer Route</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr 
                  key={item.id} 
                  style={{ 
                    backgroundColor: item.received ? '#f6ffed' : 'transparent',
                    opacity: 1 // Keep full opacity for all items
                  }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      disabled={item.received}
                      className="table-checkbox"
                    />
                  </td>
                  <td>{item.catchNo}</td>
                  <td>{item.paperTitle}</td>
                  <td>{item.language}</td>
                  <td>{item.maxMarks}</td>
                  <td>{item.duration}</td>
                  <td>{item.structureOfPaper}</td>
                 
                  <td>{item.a}</td>
                  <td>{item.b}</td>
                  <td>{item.c}</td>
                  <td>{item.d}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <div className="transfer-route">
                      <div className="transfer-from">📍 From: {getLocationName(item.fromLocation)}</div>
                      <div className="transfer-to">📍 To: {getLocationName(item.toLocation)}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${item.received ? 'status-received' : 'status-pending'}`}>
                      {item.received ? "✅ Received" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => markAsReceived(item.id)}
                      disabled={item.received}
                      className="table-action-button button-green"
                    >
                      {item.received ? "Mark Received" : "Mark Received"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div>
        
        {/* Pagination */}
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} entries
          </div>
          
          <div className="pagination-controls">
           
            <button
              className="page-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              // Show current page and 2 pages before and after
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
              ) {
                return (
                  <button
                    key={pageNumber}
                    className={`page-button ${currentPage === pageNumber ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              }
              // Show ellipsis
              if (
                pageNumber === currentPage - 3 ||
                pageNumber === currentPage + 3
              ) {
                return <span key={pageNumber}>...</span>;
              }
              return null;
            })}
            
            <button
              className="page-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            
          </div>

          <div className="items-per-page">
            <span>Items per page:</span>
            <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TTF;