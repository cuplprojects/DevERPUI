import { useState } from 'react';
import * as XLSX from 'xlsx';
import { FaFileExcel } from "react-icons/fa";
import API from "../../CustomHooks/MasterApiHooks/api";
import { Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

const ExcelExport = ({ data, projectName, groupName, visibleColumns, lotNo }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExcelExport = async () => {
    setIsExporting(true);
    try {
      const processesResponse = await API.get('/Processes');
      const processes = processesResponse.data;

      const getProcessName = (processId) => {
        const process = processes.find(p => p.id === processId);
        return process ? process.name : `Process ${processId}`;
      };

      const wb = XLSX.utils.book_new();
      const merges = [];

      // Create main data rows
      const headers = [
        'Catch No', 'Subject', 'Course', 'Paper', 'Exam Date', 'Exam Time', 
        'Quantity', 'Pages', 'Status', 'SD-ST', 'ED-ET', 'Duration', 'Current Process', 'Inner Envelope', 'Outer Envelope'
      ];

      const wsData = [
        // Title row
        [`Group: ${groupName || 'N/A'}`, `Project: ${projectName || 'N/A'}`, `Lot: ${lotNo || 'N/A'}`, 
         `Generated: ${new Date().toLocaleString()}`, `Dispatch Date: ${data[0]?.dispatchDate || 'N/A'}`],
        [], // Empty row
        headers
      ];

      let currentRow = 3; // Start after headers

      // Add each catch and its process details
      for (const item of data) {
        // Add catch data with merged cells
        const catchRow = [
         
          item.catchNo || '',
          item.subject || '',
          item.course || '',
          item.paper || '',
          item.examDate ? new Date(item.examDate).toLocaleDateString() : '',
          item.examTime || '',
          item.quantity || '',
          item.pages || '',
          item.catchStatus || '',
          item.startTime ? new Date(item.startTime).toLocaleString('en-GB', { hour12: true }) : '',
          item.endTime ? new Date(item.endTime).toLocaleString('en-GB', { hour12: true }) : '',
          item.duration || '',
          item.currentProcessName || '',
          item.innerEnvelope || '',
          item.outerEnvelope || ''
        ];
        wsData.push(catchRow);

        // Add process details if expanded
        if (item.showProcessDetails) {
          try {
            const processResponse = await API.get(`/Reports/process-wise/${item.catchNo}`);
            const processData = processResponse.data;

            // Add process headers indented
            wsData.push(
              Array(10).fill(''), // Empty row
              ['',  '', '', '', '', '', '', '', ''], // Section title
              Array(10).fill(''), // Empty row
              ['', 'Process', 'Zone', 'Team & Supervisor', 'Machine', 'Time'] // Process headers
            );

            // Add merge for "Process Details" title
            merges.push({
              s: { r: currentRow + 2, c: 1 },
              e: { r: currentRow + 2, c: 9 }
            });

            // Add process rows indented
            processData.forEach(process => {
              process.transactions.forEach(transaction => {
                wsData.push(['', // indent
                  getProcessName(process.processId),
                  transaction.zoneName || 'N/A',
                  `${transaction.supervisor ? `(${transaction.supervisor.toUpperCase()})` : 'N/A'}\n${transaction.teamMembers?.map(m => m.fullName).join(', ') || 'N/A'}`,
                  transaction.machineName || 'N/A',
                  `Start: ${new Date(transaction.startTime).toLocaleString()}\nEnd: ${new Date(transaction.endTime).toLocaleString()}`
                ]);
              });
            });

            // Add empty row after process details
            wsData.push(Array(10).fill(''));
            currentRow += processData.reduce((acc, process) => acc + process.transactions.length, 0) + 5;
          } catch (error) {
            console.error(`Error fetching process data for catch ${item.catchNo}:`, error);
          }
        }
        currentRow++;
      }

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!merges'] = merges;

      // Style the worksheet
      styleWorksheet(ws, wsData);

      XLSX.utils.book_append_sheet(wb, ws, "Report");

      // Generate Excel file
      const dateStr = new Date().toISOString().slice(0,10);
      const fileName = `${groupName || 'no-group'}_${projectName || 'no-project'}_${dateStr}.xlsx`;
      XLSX.writeFile(wb, fileName);

      // toast.success('Excel file downloaded successfully!');

    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error('Error downloading Excel file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const styleWorksheet = (ws, wsData) => {
    // Set column widths
    ws['!cols'] = [
      { wch: 5 },  // Indent column
      { wch: 15 }, // Catch No/Process
      { wch: 15 }, // SeriesName
      { wch: 20 }, // Subject/Zone
      { wch: 30 }, // Course/Team & Supervisor
      { wch: 20 }, // Paper/Machine
      { wch: 25 }, // Exam Date/Time
      { wch: 12 }, // Quantity
      { wch: 12 }, // Pages
      { wch: 15 }, // Status
      { wch: 15 }, // Start Date
      { wch: 15 }, // End Date
      { wch: 15 }, // Duration
      { wch: 20 }, // Current Process
      { wch: 15 }, // Inner Envelope
      { wch: 15 }, // Outer Envelope


    ];

    // Style each row
    wsData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
        
        if (rowIndex === 0) {
          // Title row style
          ws[cellRef].s = {
            font: { bold: true, size: 12 },
            fill: { fgColor: { rgb: "90EE90" } },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        } else if (row[1] === 'Process Details') {
          // Process section title style
          ws[cellRef].s = {
            font: { bold: true, size: 12 },
            fill: { fgColor: { rgb: "90EE90" } },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        } else if ((row[1] === 'Process' && colIndex > 0) || rowIndex === 2) {
          // Headers style (both main and process)
          ws[cellRef].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "3B99FF" } },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        } else if (cell !== '') {
          // Data cells style
          ws[cellRef].s = {
            alignment: { vertical: 'center', wrapText: true },
            border: {
              top: { style: 'thin', color: { rgb: "CCCCCC" } },
              bottom: { style: 'thin', color: { rgb: "CCCCCC" } },
              left: { style: 'thin', color: { rgb: "CCCCCC" } },
              right: { style: 'thin', color: { rgb: "CCCCCC" } }
            }
          };
        }
      });
    });
  };

  return (
    <button
      onClick={handleExcelExport}
      className="btn btn-link ms-2 px-3"
      style={{ cursor: isExporting ? 'not-allowed' : 'pointer' }}
      disabled={isExporting}
    >
      {isExporting ? (
        <div className="d-flex flex-column align-items-center">
          <Spinner animation="border" size="sm" variant="success" className="opacity-75" />
          <small className="mt-2 text-success fw-semibold">Preparing your Excel file...</small>
        </div>
      ) : (
        <FaFileExcel size={40} color='green' />
      )}
    </button>
  );
};

export default ExcelExport;
