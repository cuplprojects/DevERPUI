import React, { useState } from 'react';
import { Dropdown, Spinner } from 'react-bootstrap';
import { FaFileExcel, FaFilePdf, FaFileExport } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import API from "../../CustomHooks/MasterApiHooks/api";


/**
 * DailyReportExport component for exporting transaction data from DailyReport
 * Supports both Excel and PDF export formats
 * Exports ALL transaction data, not just the current page
 */
const DailyReportExport = ({
  selectedDate,
  selectedGroup,
  userId,
  groupName,
  processes,
  machines,
  zones,
  users
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null);

  // Helper function to get process name from process ID
  const getProcessName = (processId) => {
    const process = processes.find(p => p.id === processId);
    return process ? process.name : `Process ${processId}`;
  };

  // Helper function to get machine name from machine ID
  const getMachineName = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.name : `Machine ${machineId}`;
  };

  // Helper function to get zone name from zone ID
  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone ? zone.name : `Zone ${zoneId}`;
  };

  // Helper function to get user name from user ID (kept for future use)
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.fullName : `User ${userId}`;
  };

  // Helper function to format date and time - used in both export functions
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to format date only
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Function to fetch all transaction data
  const fetchAllTransactionData = async () => {
    try {
      const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-') : '';

      // Prepare API parameters - use a large pageSize to get all records
      // This approach is more reliable than using a custom parameter
      const params = {
        date: formattedDate,
        page: 1,
        pageSize: 10000 // Use a very large page size to get all records
      };

      // Only add userId if it's selected
      if (userId) {
        params.userId = userId;
      }

      // Only add groupId if it's selected
      if (selectedGroup) {
        params.groupId = parseInt(selectedGroup);
      }

      console.log("Fetching all transaction data with params:", params);
      const response = await API.get(`/Reports/DailyReports`, { params });
      console.log("Fetched transaction data:", response.data);

      // If the API returns paginated data, use userTransactionDetails
      if (response.data && response.data.userTransactionDetails) {
        return response.data.userTransactionDetails || [];
      }

      // If the API returns an array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching all transaction data:", error);

      return [];
    }
  };

  // Function to handle Excel export
  const handleExcelExport = async () => {
    setIsExporting(true);
    setExportType('excel');

    try {
      // Fetch all transaction data
      const allTransactions = await fetchAllTransactionData();

      if (allTransactions.length === 0) {
        toast.warning('No data available to export.');
        return;
      }

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Define headers - exactly match the transaction table columns
      const headers = [
        'S.No',
        'Catch No',
        'Process',
        'Zone',
        'Machine',
        'Quantity',
        'Time Range',
        'Team Members'
      ];

      // Prepare data for Excel
      const wsData = [headers];

      // Format time range function
      const formatTimeRange = (startTime, endTime) => {
        if (!startTime || !endTime) return 'N/A';
        try {
          const startDate = new Date(startTime);
          const endDate = new Date(endTime);

          const startFormatted = startDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          const endFormatted = endDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          return `${startFormatted} to ${endFormatted}`;
        } catch (error) {
          console.error("Error formatting date range:", error);
          return 'Invalid time';
        }
      };

      // Add transaction data rows
      allTransactions.forEach((transaction, index) => {
        // Get team members as a string
        let teamMembersStr = '';
        if (transaction.teamMembersNames && transaction.teamMembersNames.length > 0) {
          teamMembersStr = transaction.teamMembersNames.join(', ');
        } else if (transaction.teamMembers && transaction.teamMembers.length > 0) {
          teamMembersStr = transaction.teamMembers.map(member => {
            return member.fullName || member.name || `Member ${member.id || index}`;
          }).join(', ');
        }

        // We don't need supervisor name for the export as it's not in the table

        const row = [
          index + 1,
          transaction.catchNo || '',
          getProcessName(transaction.processId),
          getZoneName(transaction.zoneId),
          getMachineName(transaction.machineId),
          transaction.quantity || 0,
          formatTimeRange(transaction.startTime, transaction.endTime),
          teamMembersStr
        ];
        wsData.push(row);
      });

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },   // S.No
        { wch: 15 },  // Catch No
        { wch: 20 },  // Process
        { wch: 15 },  // Zone
        { wch: 15 },  // Machine
        { wch: 10 },  // Quantity
        { wch: 25 },  // Time Range
        { wch: 40 }   // Team Members
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Daily Report");

      // Generate Excel file
      const dateStr = selectedDate ? new Date(selectedDate).toISOString().slice(0,10) : new Date().toISOString().slice(0,10);
      const fileName = `DailyReport_${groupName || 'All'}_${dateStr}.xlsx`;
      XLSX.writeFile(wb, fileName);



    } catch (error) {
      console.error("Error exporting to Excel:", error);

    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Function to handle PDF export
  const handlePdfExport = async () => {
    setIsExporting(true);
    setExportType('pdf');

    try {
      console.log("Starting PDF export...");

      // Fetch all transaction data
      const allTransactions = await fetchAllTransactionData();

      if (!allTransactions || allTransactions.length === 0) {
        toast.warning('No data available to export.');
        setIsExporting(false);
        setExportType(null);
        return;
      }

      console.log(`Preparing PDF export with ${allTransactions.length} records...`);

      try {
        // Create PDF in landscape A4 format with optimized layout
        const doc = new jsPDF('l', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margins = {
          top: 30,
          bottom: 25,
          left: 15,
          right: 15
        };

        // We'll add the header in didDrawPage to ensure it appears on every page


        // Format time range function
        const formatTimeRange = (startTime, endTime) => {
          if (!startTime || !endTime) return 'N/A';
          try {
            const startDate = new Date(startTime);
            const endDate = new Date(endTime);

            const startFormatted = startDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });

            const endFormatted = endDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });

            return `${startFormatted} to ${endFormatted}`;
          } catch (error) {
            console.error("Error formatting date range:", error);
            return 'Invalid time';
          }
        };

        // Prepare data for PDF table
        const tableData = [];

        for (let i = 0; i < allTransactions.length; i++) {
          const transaction = allTransactions[i];

          // Get team members as a string
          let teamMembersStr = '';
          if (transaction.teamMembersNames && transaction.teamMembersNames.length > 0) {
            teamMembersStr = transaction.teamMembersNames.join(', ');
          } else if (transaction.teamMembers && transaction.teamMembers.length > 0) {
            teamMembersStr = transaction.teamMembers.map(member => {
              return member.fullName || member.name || `Member ${member.id || i}`;
            }).join(', ');
          }

          // Get process name safely
          let processName = '';
          try {
            if (transaction.processId) {
              processName = getProcessName(transaction.processId);
            } else if (transaction.process) {
              processName = transaction.process;
            }
          } catch (error) {
            console.error("Error getting process name:", error);
          }

          // Get zone name safely
          let zoneName = '';
          try {
            if (transaction.zoneId) {
              zoneName = getZoneName(transaction.zoneId);
            } else if (transaction.zone) {
              zoneName = transaction.zone;
            }
          } catch (error) {
            console.error("Error getting zone name:", error);
          }

          // Get machine name safely
          let machineName = '';
          try {
            if (transaction.machineId) {
              machineName = getMachineName(transaction.machineId);
            } else if (transaction.machine) {
              machineName = transaction.machine;
            }
          } catch (error) {
            console.error("Error getting machine name:", error);
          }

          const row = [
            i + 1,
            transaction.catchNo || '',
            processName,
            zoneName,
            machineName,
            transaction.quantity || 0,
            formatTimeRange(transaction.startTime, transaction.endTime),
            teamMembersStr
          ];

          tableData.push(row);
        }

        // Define column headers - exactly match the transaction table columns
        const headers = [
          ['S.No', 'Catch No', 'Process', 'Zone', 'Machine', 'Quantity', 'Time Range', 'Team Members']
        ];

        // Define column widths - optimized for A4 landscape with proper proportions
        // Define column widths as percentages of total width (adding up to 100%)
        const columnWidths = {
          0: { cellWidth: '7%', cellPadding: 2 },     // S.No - smallest column (7%)
          1: { cellWidth: '10%', cellPadding: 3 },    // Catch No (10%)
          2: { cellWidth: '13%', cellPadding: 3 },    // Process (13%)
          3: { cellWidth: '10%', cellPadding: 3 },    // Zone (10%)
          4: { cellWidth: '10%', cellPadding: 3 },    // Machine (10%)
          5: { cellWidth: '8%', cellPadding: 3 },     // Quantity - smaller (8%)
          6: { cellWidth: '17%', cellPadding: 3 },    // Time Range (17%)
          7: { cellWidth: '25%', cellPadding: 3 }     // Team Members - largest (25%)
        };

        console.log("Creating PDF table with styling to match example...");

        // Calculate the starting Y position - after the header info
        const tableStartY = 35; // Position after the header info

        // Create the table with professional styling matching the example
        doc.autoTable({
          head: headers,
          body: tableData,
          startY: tableStartY,
          margin: margins,
          styles: {
            fontSize: 9,
            cellPadding: { top: 6, right: 4, bottom: 6, left: 4 }, // Improved padding for better spacing
            halign: 'center',
            lineColor: [200, 200, 200], // Light gray grid lines
            lineWidth: 0.1,
            font: "helvetica",
            textColor: [60, 60, 60],
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [37, 56, 60], // Dark blue-gray header background
            textColor: [255, 255, 255], // White text for better contrast
            fontSize: 10, // Slightly larger font for headers
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: { top: 8, right: 4, bottom: 8, left: 4 }, // More vertical padding for headers
            valign: 'middle'
          },
          // Improved body styles for better readability
          bodyStyles: {
            valign: 'middle',
            fontSize: 9,
            lineHeight: 1.3 // Improved line height for better readability
          },
          // Add subtle alternating row colors for better readability
          alternateRowStyles: {
            fillColor: [245, 245, 245] // Very light gray for alternate rows
          },
          columnStyles: columnWidths,
          theme: 'grid', // Grid theme with borders like example
          tableLineColor: [200, 200, 200], // Light gray border
          tableLineWidth: 0.2,
          // Only show headers on first page
          showHead: 'firstPage',

          didDrawPage: function() {
            // Get current page number
            const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

            // Add title with professional styling only on the first page
            if (currentPage === 1) {
              doc.setFontSize(18);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(44, 62, 80); // Dark blue-gray color
              doc.text('Daily Report', pageWidth / 2, 15, { align: 'center' });
            }

            // Add a subtle separator line on all pages
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(margins.left, 20, pageWidth - margins.right, 20);

            // Add date on left side on all pages
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            const dateText = `Date: ${formatDate(selectedDate)}`;
            doc.text(dateText, margins.left, 25);

            // Add group info if available on all pages
            if (groupName) {
              doc.text(`Group: ${groupName}`, margins.left + 60, 25);
            }

            // Simple footer with just page number like the example on all pages
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            doc.text(
              `Page ${currentPage} of ${doc.internal.getNumberOfPages()}`,
              pageWidth / 2,
              pageHeight - 10,
              { align: 'center' }
            );
          }
        });

        console.log("PDF table created, saving file...");

        // The example doesn't have a notes section, so we'll skip it
        // No additional content needed after the table

        // Save PDF with clean filename like the example
        const dateStr = selectedDate ? new Date(selectedDate).toISOString().slice(0,10) : new Date().toISOString().slice(0,10);
        const formattedDate = dateStr.replace(/-/g, '');
        const fileName = `DailyReport_${groupName || 'All'}_${formattedDate}.pdf`;

        try {
          doc.save(fileName);
          console.log("PDF saved successfully!");


        } catch (saveError) {
          console.error("Error saving PDF:", saveError);

          throw saveError;
        }
      } catch (pdfError) {
        console.error("Error creating PDF:", pdfError);

        throw pdfError;
      }
    } catch (error) {
      console.error("Error in PDF export process:", error);

    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <>


      <Dropdown className="d-inline-block">
        <Dropdown.Toggle variant="primary" id="export-dropdown" className="me-2">
          <FaFileExport className="me-2" />
          Export
        </Dropdown.Toggle>

        <Dropdown.Menu className="mt-1">
          <Dropdown.Item
            onClick={handleExcelExport}
            className="py-2"
            disabled={isExporting}
          >
            {isExporting && exportType === 'excel' ? (
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" variant="success" className="opacity-75 me-2" />
                <span className="text-success">Preparing Excel...</span>
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <FaFileExcel size={20} color="green" className="me-2" />
                <span>Export to Excel</span>
              </div>
            )}
          </Dropdown.Item>

          <div className="dropdown-divider"></div>

          <Dropdown.Item
            onClick={handlePdfExport}
            className="py-2"
            disabled={isExporting}
          >
            {isExporting && exportType === 'pdf' ? (
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" variant="danger" className="opacity-75 me-2" />
                <span className="text-danger">Preparing PDF...</span>
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <FaFilePdf size={20} color="red" className="me-2" />
                <span>Export to PDF</span>
              </div>
            )}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default DailyReportExport;
