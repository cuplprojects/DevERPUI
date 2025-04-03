import React from "react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-enterprise';
import { Button } from "react-bootstrap";
import { CheckCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import { message } from "antd";
import API from "../../CustomHooks/MasterApiHooks/api";

const MSSTable = ({ quantitySheetData, fetchQuantitySheetData, languageOptions }) => {
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);

  const handleMarkReceived = async (data) => {
    try {
      const updatedData = { ...data, mssStatus: 2 };
      await API.put(`/QuantitySheet/UpdateStatus?id=${data.quantitySheetId}`, updatedData);
      message.success("Item marked as received successfully");
      await fetchQuantitySheetData();
    } catch (error) {
      console.error("Failed to mark as received:", error);
      message.error("Failed to mark as received");
    }
  };

  const handleRemove = async (data) => {
    try {
      await API.delete(`/QuantitySheet/${data.quantitySheetId}`);
      message.success("Item removed successfully");
      await fetchQuantitySheetData();
    } catch (error) {
      console.error("Failed to remove item:", error);
      message.error("Failed to remove item");
    }
  };

  const ActionCellRenderer = (params) => {
    return (
      <div className="d-flex gap-2 justify-content-center">
        <Button
          variant="outline-success"
          size="sm"
          onClick={() => handleMarkReceived(params.data)}
          disabled={params.data.mssStatus === 2}
          title="Mark as Received"
        >
          <CheckCircleOutlined />
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => handleRemove(params.data)}
          title="Remove"
        >
          <DeleteOutlined />
        </Button>
      </div>
    );
  };

  const columnDefs = [
    {
      headerName: "Catch No",
      field: "catchNo",
      editable: true,
      sortable: true,
      filter: true,
      width: 120
    },
    {
      headerName: "Duration",
      field: "duration",
      editable: true,
      sortable: true,
      filter: true,
      width: 120
    },
    {
      headerName: "Course",
      field: "courseName",
      editable: true,
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: "Subject",
      field: "subjectName",
      editable: true,
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: "Language",
      field: "languageId",
      editable: true,
      suppressFillHandle: false,
      enableFillHandle: true,
      fillHandleDirection: 'xy',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        if (Array.isArray(params.value)) {
          return params.value.map(id => {
            const language = languageOptions.find(l => l.languageId === id);
            return language ? language.languageName : id;
          }).join(', ');
        }
        return params.value;
      }
    },
    {
      headerName: "Max Marks",
      field: "maxMarks",
      editable: true,
      sortable: true,
      filter: true,
      width: 120,
      valueParser: (params) => {
        return Number(params.newValue);
      }
    },
    {
      headerName: "NEP Code",
      field: "nepCode",
      editable: true,
      sortable: true,
      filter: true,
      width: 130
    },
    {
      headerName: "Private Code",
      field: "privateCode",
      editable: true,
      sortable: true,
      filter: true,
      width: 130
    },
    {
      headerName: "MSS Status",
      field: "mssStatus",
      editable: true,
      sortable: true,
      filter: true,
      width: 120,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [0, 1, 2],
        valueFormatter: (params) => {
          const statusMap = {
            0: 'Pending',
            1: 'Started',
            2: 'Completed'
          };
          return statusMap[params.value] || '';
        }
      },
      valueFormatter: (params) => {
        const statusMap = {
          0: 'Pending',
          1: 'Started',
          2: 'Completed'
        };
        return statusMap[params.value] || '';
      }
    },
    {
      headerName: "Actions",
      field: "actions",
      sortable: false,
      filter: false,
      editable: false,
      pinned: 'right',
      width: 120,
      cellRenderer: ActionCellRenderer
    }
  ];

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
    enableFillHandle: true,
    sortable: true,
    filter: true,
    editable: true,
    movable: true,
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    params.api.sizeColumnsToFit();
  };

  const onCellValueChanged = async (params) => {
    console.log("Cell value changed:", params);
    try {
      const updatedData = params.data;
      await API.put(`/QuantitySheet/update/${updatedData.quantitySheetId}`, updatedData);
      message.success("Data updated successfully");
    } catch (error) {
      console.error("Failed to update data:", error);
      message.error("Failed to update data");
      gridApi.refreshCells();
    }
  };

  return (
    <div
      className="ag-theme-alpine"
      style={{
        height: 400,
        width: '100%'
      }}
    >
      <AgGridReact
        rowData={quantitySheetData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        onCellValueChanged={onCellValueChanged}
        pagination={true}
        paginationPageSize={10}
        rowSelection="multiple"
        enableCellTextSelection={true}
        stopEditingWhenCellsLoseFocus={true}
        suppressRowClickSelection={true}
        undoRedoCellEditing={true}
        undoRedoCellEditingLimit={20}
        suppressMovableColumns={false}
        enableFilter={true}
        enableColResize={true}
        enableSorting={true}
        suppressColumnVirtualisation={false}
      />
    </div>
  );
};

export default MSSTable;
