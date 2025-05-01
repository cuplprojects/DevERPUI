import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaFilePdf } from "react-icons/fa6";
import API from "../../CustomHooks/MasterApiHooks/api";
import { Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

const PdfExport = ({ data, projectName, groupName, visibleColumns, lotNo }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      console.log("Starting PDF export...");

      // First fetch processes list for names
      const processesResponse = await API.get('/Processes');
      const processes = processesResponse.data;

      const getProcessName = (processId) => {
        const process = processes.find(p => p.id === processId);
        return process ? process.name : `Process ${processId}`;
      };

      // Create PDF in landscape A4 format with larger margins
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margins = {
        top: 20,
        bottom: 20,
        left: 10,
        right: 10
      };

      // Add title
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.setFont("helvetica", "bold");
      doc.text('Report', pageWidth / 2, margins.top - 5, { align: 'center' });

      // Add project and group info
      doc.setFontSize(10);
      doc.setTextColor(52, 73, 94);
      doc.setFont("helvetica", "normal");

      doc.text(`Group: ${groupName || 'N/A'}`, margins.left, margins.top + 5);
      doc.text(`Project: ${projectName || 'N/A'}`, margins.left, margins.top + 12);
      doc.text(`Lot No: ${lotNo || 'N/A'}`, pageWidth - 80, margins.top + 5);
      doc.text(`Dispatch Date: ${data[0]?.dispatchDate || 'N/A'}`, pageWidth - 80, margins.top + 12);

      let yPos = margins.top + 20;

      // Check if any catch has showProcessDetails true
      const hasExpandedProcesses = data.some(item => item.showProcessDetails);

      if (!hasExpandedProcesses) {
        // Create headers array based on visible columns
        const headers = [[
          visibleColumns.catchNo ? 'Catch No' : null,
          visibleColumns.subject ? 'Subject' : null,
          visibleColumns.course ? 'Course' : null,
          visibleColumns.paper ? 'Paper' : null,
          visibleColumns.examDate ? 'Exam Date' : null,
          visibleColumns.examTime ? 'Exam Time' : null,
          visibleColumns.quantity ? 'Quantity' : null,
          visibleColumns.pages ? 'Pages' : null,
          visibleColumns.status ? 'Status' : null,
          visibleColumns.startTime ? 'SD-ST' : null,
          visibleColumns.endTime ? 'ED-ET' : null,
          visibleColumns.duration ? 'Duration' : null,
          visibleColumns.currentProcess ? 'Current Process' : null,
          visibleColumns.innerEnvelope ? 'Inner Envelope' : null,
          visibleColumns.outerEnvelope ? 'Outer Envelope' : null
        ].filter(Boolean)];

        // Create table data based on visible columns
        const tableData = data.map(catchItem => {
          const row = [];
          if (visibleColumns.catchNo) row.push(catchItem.catchNo || '');
          if (visibleColumns.subject) row.push(catchItem.subject || '');
          if (visibleColumns.course) row.push(catchItem.course || '');
          if (visibleColumns.paper) row.push(catchItem.paper || '');
          if (visibleColumns.examDate) row.push(catchItem.examDate ? new Date(catchItem.examDate).toLocaleDateString() : '');
          if (visibleColumns.examTime) row.push(catchItem.examTime || '');
          if (visibleColumns.quantity) row.push(catchItem.quantity || '');
          if (visibleColumns.pages) row.push(catchItem.pages || '');
          if (visibleColumns.status) row.push(catchItem.catchStatus || '');
          if (visibleColumns.startTime) row.push(catchItem.startTime ? new Date(catchItem.startTime).toLocaleString('en-GB', {hour12: true}) : '');
          if (visibleColumns.endTime) row.push(catchItem.endTime ? new Date(catchItem.endTime).toLocaleString('en-GB', {hour12: true}) : '');
          if (visibleColumns.duration) row.push(catchItem.duration || '');
          if (visibleColumns.currentProcess) row.push(catchItem.currentProcessName || '');
          if (visibleColumns.innerEnvelope) row.push(catchItem.innerEnvelope || '');
          if (visibleColumns.outerEnvelope) row.push(catchItem.outerEnvelope || '');
          return row;
        });

        // Calculate column widths based on visible columns
        const columnWidths = {};
        let visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length;
        let baseWidth = Math.floor((pageWidth - margins.left - margins.right) / visibleColumnCount);
        
        let currentColumn = 0;
        if (visibleColumns.catchNo) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.subject) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.course) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.paper) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.examDate) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.examTime) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.quantity) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.pages) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.status) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.startTime) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.endTime) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.duration) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.currentProcess) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.innerEnvelope) columnWidths[currentColumn++] = { cellWidth: baseWidth };
        if (visibleColumns.outerEnvelope) columnWidths[currentColumn++] = { cellWidth: baseWidth };

        // Create the table with dynamic columns
        doc.autoTable({
          head: headers,
          body: tableData,
          startY: yPos,
          margin: margins,
          styles: {
            fontSize: 7,
            cellPadding: 2,
            halign: 'center',
            lineColor: [0, 0, 0],
            lineWidth: 0.3,
            font: "helvetica",
            textColor: [60, 60, 60],
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [37, 56, 60],
            textColor: [255, 255, 255],
            fontSize: 7.5,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 3
          },
          columnStyles: columnWidths,
          theme: 'grid',
          showHead: 'firstPage',
          didDrawPage: function(data) {
            doc.setFontSize(8);
            doc.text(
              `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()}`,
              pageWidth / 2,
              pageHeight - 10,
              { align: 'center' }
              );
            yPos = margins.top;
          }
        });
      } else {
        // Original detailed export with process details for expanded catches
        // Define headers once
        const headers = [
          [...Object.entries(visibleColumns)
            .filter(([_, isVisible]) => isVisible)
            .map(([column]) => {
              switch (column) {
                case 'catchNo': return 'Catch No';
                case 'subject': return 'Subject';
                case 'course': return 'Course';
                case 'paper': return 'Paper';
                case 'examDate': return 'Exam Date';
                case 'examTime': return 'Exam Time';
                case 'quantity': return 'Quantity';
                case 'pages': return 'Pages';
                case 'status': return 'Status';
                case 'startTime': return 'SD-ST';
                case 'endTime': return 'ED-ET';
                case 'duration': return 'Duration';
                case 'currentProcess': return 'Current Process';
                case 'innerEnvelope': return 'Inner Envelope';
                case 'outerEnvelope': return 'Outer Envelope';
                default: return '';
              }
            })
          ]
        ];

        // For each catch in the data
        for (const catchItem of data) {
          // Get catch details and create table
          const catchDetails = Object.entries(visibleColumns)
            .filter(([_, isVisible]) => isVisible)
            .map(([column]) => {
              switch (column) {
                case 'catchNo': return catchItem.catchNo || '';
                case 'subject': return catchItem.subject || '';
                case 'course': return catchItem.course || '';
                case 'paper': return catchItem.paper || '';
                case 'examDate': return catchItem.examDate ? new Date(catchItem.examDate).toLocaleDateString() : '';
                case 'examTime': return catchItem.examTime || '';
                case 'quantity': return catchItem.quantity || '';
                case 'pages': return catchItem.pages || '';
                case 'status': return catchItem.catchStatus || '';
                case 'startTime': return catchItem.startTime ? new Date(catchItem.startTime).toLocaleString('en-GB', {hour12: true}) : '';
                case 'endTime': return catchItem.endTime ? new Date(catchItem.endTime).toLocaleString('en-GB', {hour12: true}) : '';
                case 'duration': return catchItem.duration || '';
                case 'currentProcess': return catchItem.currentProcessName || '';
                case 'innerEnvelope': return catchItem.innerEnvelope || '';
                case 'outerEnvelope': return catchItem.outerEnvelope || '';
                default: return '';
              }
            });

          // Create catch details table with adjusted settings
          doc.autoTable({
            head: headers,
            body: [catchDetails],
            startY: yPos,
            margin: margins,
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'center',
              lineColor: [0, 0, 0],
              lineWidth: 0.3,
              striped: true,
              stripedColors: [[255, 255, 255], [240, 240, 240]],
              font: "helvetica",
              textColor: [60, 60, 60],
              overflow: 'linebreak'
            },
            headStyles: {
              fillColor: [37, 56, 60],
              textColor: [255, 255, 255],
              fontSize: 7.5,
              fontStyle: 'bold',
              halign: 'center',
              cellPadding: 3
            },
            columnStyles: {
              // Add dynamic column widths based on content
              ...Object.fromEntries(
                Object.keys(visibleColumns).map((_, index) => [index, { cellWidth: 'auto' }])
              )
            },
            theme: 'grid',
            showHead: 'firstPage',
            didDrawPage: function(data) {
              // Add page number
              doc.setFontSize(8);
              doc.text(
                `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
              );
              yPos = margins.top;
            }
          });

          yPos = doc.lastAutoTable.finalY;  // Remove the +10 spacing

          // Process details section - now immediately after the catch row
          if (catchItem.showProcessDetails) {
            let processTableData = [];
            try {
              console.log(`Fetching process data for catch ${catchItem.catchNo}`);
              const processResponse = await API.get(`/Reports/process-wise/${catchItem.catchNo}`);
              const processData = processResponse.data;

              processTableData = processData.map(process =>
                process.transactions.map(transaction => {
                  const supervisorText = transaction.supervisor ? 
                    `(${transaction.supervisor.toUpperCase()})` : '';
                  const teamMembersText = transaction.teamMembers?.map(m => m.fullName).join(', ') || '';
                  
                  return [
                    getProcessName(process.processId),
                    transaction.zoneName || '',
                    `${supervisorText}\n${teamMembersText}`,
                    transaction.machineName || '',
                    `Start: ${new Date(transaction.startTime).toLocaleString('en-GB', {hour12: true})}\nEnd: ${new Date(transaction.endTime).toLocaleString('en-GB', {hour12: true})}`
                  ];
                })
              ).flat();

              if (processTableData.length > 0) {
                // Add process table immediately after catch row
                doc.autoTable({
                  head: [['Process', 'Zone', 'Team & Supervisor', 'Machine', 'Time']],
                  body: processTableData,
                  startY: yPos,
                  margin: {
                    ...margins,
                    left: margins.left + 0  // Slightly more indent for better spacing
                  },
                  // width: "100%",
                  styles: {
                    fontSize: 8,  // Slightly larger font for better readability
                    cellPadding: 3,  // More padding for breathing room
                    lineColor: [220, 220, 220],  // Even lighter grid lines
                    lineWidth: 0.1,  // Thinner lines for elegance
                    font: "helvetica",
                    overflow: 'linebreak',
                    halign: 'center',
                    valign: 'middle',  // Vertical centering
                    fillColor: [252, 252, 252],// Very light background for contrast
                  },
                  headStyles: {
                    fillColor: [37, 80, 92],  // Dark teal header (#25505c)
                    textColor: [255, 255, 255],  // White text for contrast
                    fontSize: 9.5,
                    fontStyle: 'bold',
                    halign: 'center',
                    cellPadding: 4  // Extra padding for header
                  },
                  columnStyles: {
                    0: {cellWidth: "20%"},  // Process - slightly wider
                    1: {cellWidth: "10%"},  // Zone
                    2: {cellWidth: "30%"},  // Team & Supervisor - wider for names
                    3: {cellWidth: "20%"},  // Machine
                    4: {cellWidth: "20%"}   // Time - adjusted for format
                  },
                  alternateRowStyles: {
                    fillColor: [245, 245, 245]  // Subtle alternate row coloring
                  },
                  theme: 'grid',
                  showHead: 'everyPage'
                });

                yPos = doc.lastAutoTable.finalY + 8;  // Slightly more spacing after table
              }
            } catch (error) {
              console.error(`Error fetching process data for catch ${catchItem.catchNo}:`, error);
            }
          } else {
            yPos += 5;  // Small spacing if no process details
          }

          if (yPos > pageHeight - margins.bottom) {
            doc.addPage();
            yPos = margins.top;
          }
        }
      }

      // Save PDF
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `${groupName || 'no-group'}_${projectName || 'no-project'}_${dateStr}.pdf`;
      doc.save(fileName);

      // toast.success('PDF downloaded successfully!');

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error('Error downloading PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToPDF}
      className="btn btn-link ms-2 px-3"
      style={{ cursor: isExporting ? 'not-allowed' : 'pointer' }}
      disabled={isExporting}
    >
      {isExporting ? (
        <div className="d-flex flex-column align-items-center">
          <Spinner animation="border" size="sm" variant="purple" className="opacity-75" />
          <small className="mt-2 text-purple fw-semibold">Preparing your PDF...</small>
        </div>
      ) : (
        <FaFilePdf size={40} color='purple' />
      )}
    </button>
  );
};

export default PdfExport;
