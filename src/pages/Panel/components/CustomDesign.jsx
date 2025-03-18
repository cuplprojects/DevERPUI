import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
// import { Stage, Layer, Text, Transformer, Line } from 'react-konva';
import { FaPlus, FaFont, FaPalette, FaAlignLeft, FaAlignCenter, FaAlignRight, 
         FaBold, FaItalic, FaUnderline, FaDownload, FaCode, FaImage, 
         FaTrash, FaCopy, FaThLarge } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #dee2e6;
  flex-wrap: wrap;

  .tool-group {
    display: flex;
    gap: 0.25rem;
    padding: 0 0.5rem;
    border-right: 1px solid #dee2e6;
    
    &:last-child {
      border-right: none;
    }
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
  padding: 1rem;
  height: calc(100vh - 64px);
  overflow: hidden;
`;

const CanvasContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
`;

const SidePanel = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  overflow-y: auto;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const ToolButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
  }

  &.active {
    background: #e9ecef;
    color: #007bff;
    border-color: #007bff;
  }
`;

const ExportButton = styled(ToolButton)`
  width: auto;
  padding: 0 1rem;
  gap: 0.5rem;
`;

const TextElement = ({ text, isSelected, onSelect, onChange }) => {
  const textRef = useRef();
  const transformerRef = useRef();

  React.useEffect(() => {
    if (isSelected && transformerRef.current) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={textRef}
        text={text.content}
        x={text.x}
        y={text.y}
        fontSize={text.fontSize}
        fontFamily={text.fontFamily}
        fill={text.color}
        fontStyle={text.fontStyle}
        textDecoration={text.textDecoration}
        align={text.align}
        rotation={text.rotation || 0}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onTransformEnd={(e) => {
          const node = textRef.current;
          const rotation = node.rotation();
          onChange({
            ...text,
            rotation: rotation,
            x: node.x(),
            y: node.y(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotationSnapTolerance={5}
          boundBoxFunc={(oldBox, newBox) => {
            const text = textRef.current;
            text.width(newBox.width);
            text.scaleX(1);
            text.scaleY(1);
            return newBox;
          }}
        />
      )}
    </>
  );
};

const Grid = ({ width, height, spacing = 20 }) => {
  return (
    <>
      {/* Vertical lines */}
      {Array.from({ length: Math.floor(width / spacing) }, (_, i) => (
        <Line
          key={`v${i}`}
          points={[i * spacing, 0, i * spacing, height]}
          stroke="#ddd"
          strokeWidth={0.5}
          dash={[2, 4]}
        />
      ))}
      {/* Horizontal lines */}
      {Array.from({ length: Math.floor(height / spacing) }, (_, i) => (
        <Line
          key={`h${i}`}
          points={[0, i * spacing, width, i * spacing]}
          stroke="#ddd"
          strokeWidth={0.5}
          dash={[2, 4]}
        />
      ))}
    </>
  );
};

const GuideLines = ({ guides }) => {
  return guides.map((guide, i) => (
    <Line
      key={i}
      points={guide.points}
      stroke="#0d6efd"
      strokeWidth={1}
      dash={[4, 6]}
    />
  ));
};

const SmartGuide = ({ points, color = '#FF4D00' }) => (
  <Line
    points={points}
    stroke={color}
    strokeWidth={1}
  />
);

const CustomDesign = ({ onUpdate }) => {
  const [texts, setTexts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [showGrid, setShowGrid] = useState(false);
  const [alignmentGuides, setAlignmentGuides] = useState([]);
  const [canvasBackground, setCanvasBackground] = useState('#ffffff');
  const stageRef = useRef();

  const handleAddText = () => {
    const newText = {
      id: Date.now(),
      content: 'Double click to edit',
      x: 100,
      y: 100,
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#000000',
      rotation: 0,
      align: 'left',
      fontStyle: '',
      textDecoration: '',
    };
    setTexts([...texts, newText]);
  };

  const handleTextChange = (id, newProps) => {
    setTexts(texts.map(text => 
      text.id === id 
        ? { ...text, ...newProps }
        : text
    ));
  };

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  const generateHTML = () => {
    return texts.map(text => `
      <div style="
        position: absolute;
        left: ${text.x}px;
        top: ${text.y}px;
        font-size: ${text.fontSize}px;
        font-family: ${text.fontFamily};
        color: ${text.color};
        transform: rotate(${text.rotation}deg);
        transform-origin: left top;
        ${text.fontStyle?.includes('bold') ? 'font-weight: bold;' : ''}
        ${text.fontStyle?.includes('italic') ? 'font-style: italic;' : ''}
        ${text.textDecoration ? `text-decoration: ${text.textDecoration};` : ''}
        ${text.align ? `text-align: ${text.align};` : ''}
      ">
        ${text.content}
      </div>
    `).join('');
  };

  React.useEffect(() => {
    if (onUpdate) {
      onUpdate(generateHTML());
    }
  }, [texts]);

  const handleExportHTML = () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Exported Design</title>
          <style>
            .design-container {
              position: relative;
              width: ${stageSize.width}px;
              height: ${stageSize.height}px;
              background: ${canvasBackground};
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <div class="design-container">
            ${generateHTML()}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notification-template.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const canvas = await html2canvas(stageRef.current.content);
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [stageSize.width, stageSize.height]
    });
    pdf.addImage(imgData, 'JPEG', 0, 0, stageSize.width, stageSize.height);
    pdf.save('notification-template.pdf');
  };

  const handleExportImage = async () => {
    const canvas = await html2canvas(stageRef.current.content);
    const url = canvas.toDataURL('image/jpeg', 1.0);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notification-template.jpg';
    a.click();
  };

  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector('.canvas-container');
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleTextStyle = (style) => {
    if (!selectedId) return;
    
    const updatedTexts = texts.map(text => {
      if (text.id === selectedId) {
        switch (style) {
          case 'bold':
            return {
              ...text,
              fontStyle: text.fontStyle?.includes('bold') 
                ? text.fontStyle.replace('bold', '').trim() 
                : `${text.fontStyle || ''} bold`.trim()
            };
          case 'italic':
            return {
              ...text,
              fontStyle: text.fontStyle?.includes('italic') 
                ? text.fontStyle.replace('italic', '').trim() 
                : `${text.fontStyle || ''} italic`.trim()
            };
          case 'underline':
            return {
              ...text,
              textDecoration: text.textDecoration === 'underline' ? '' : 'underline'
            };
          default:
            return text;
        }
      }
      return text;
    });
    
    setTexts(updatedTexts);
  };

  const handleTextAlign = (align) => {
    if (!selectedId) return;
    
    setTexts(texts.map(text => 
      text.id === selectedId 
        ? { ...text, align } 
        : text
    ));
  };

  const selectedText = texts.find(t => t.id === selectedId);

  const calculateAlignmentGuides = (activeNode) => {
    const guides = [];
    const THRESHOLD = 5;
    
    const activeBox = activeNode.getClientRect();
    const activeCenter = {
      x: activeBox.x + activeBox.width / 2,
      y: activeBox.y + activeBox.height / 2
    };

    const canvasCenter = {
      x: stageSize.width / 2,
      y: stageSize.height / 2
    };

    if (Math.abs(activeCenter.x - canvasCenter.x) < THRESHOLD) {
      guides.push({
        points: [canvasCenter.x, 0, canvasCenter.x, stageSize.height],
        snap: { x: canvasCenter.x - activeBox.width / 2 }
      });
    }

    if (Math.abs(activeCenter.y - canvasCenter.y) < THRESHOLD) {
      guides.push({
        points: [0, canvasCenter.y, stageSize.width, canvasCenter.y],
        snap: { y: canvasCenter.y - activeBox.height / 2 }
      });
    }

    texts.forEach(text => {
      if (text.id === activeNode.id()) return;

      const otherNode = stageRef.current.findOne(`#${text.id}`);
      const otherBox = otherNode.getClientRect();
      const otherCenter = {
        x: otherBox.x + otherBox.width / 2,
        y: otherBox.y + otherBox.height / 2
      };

      const verticalAlignments = [
        { value: otherBox.x, reference: activeBox.x },
        { value: otherCenter.x, reference: activeCenter.x },
        { value: otherBox.x + otherBox.width, reference: activeBox.x + activeBox.width }
      ];

      verticalAlignments.forEach(({ value, reference }) => {
        if (Math.abs(reference - value) < THRESHOLD) {
          guides.push({
            points: [value, 0, value, stageSize.height],
            snap: { x: value - (reference - activeBox.x) }
          });
        }
      });

      const horizontalAlignments = [
        { value: otherBox.y, reference: activeBox.y },
        { value: otherCenter.y, reference: activeCenter.y },
        { value: otherBox.y + otherBox.height, reference: activeBox.y + activeBox.height }
      ];

      horizontalAlignments.forEach(({ value, reference }) => {
        if (Math.abs(reference - value) < THRESHOLD) {
          guides.push({
            points: [0, value, stageSize.width, value],
            snap: { y: value - (reference - activeBox.y) }
          });
        }
      });
    });

    return guides;
  };

  const handleDragMove = (e) => {
    const node = e.target;
    const guides = calculateAlignmentGuides(node);
    setAlignmentGuides(guides);

    if (guides.length > 0) {
      const newPosition = { x: node.x(), y: node.y() };
      
      guides.forEach(guide => {
        if (guide.snap.x !== undefined) {
          newPosition.x = guide.snap.x;
        }
        if (guide.snap.y !== undefined) {
          newPosition.y = guide.snap.y;
        }
      });

      node.position(newPosition);
    }
  };

  const handleDragEnd = () => {
    setAlignmentGuides([]);
  };

  return (
    <EditorContainer>
      <Toolbar>
        <div className="tool-group">
          <ToolButton onClick={() => handleAddText()}>
            <FaPlus />
          </ToolButton>
        </div>

        <div className="tool-group">
          <ToolButton onClick={() => handleTextStyle('bold')}>
            <FaBold />
          </ToolButton>
          <ToolButton onClick={() => handleTextStyle('italic')}>
            <FaItalic />
          </ToolButton>
          <ToolButton onClick={() => handleTextStyle('underline')}>
            <FaUnderline />
          </ToolButton>
        </div>

        <div className="tool-group">
          <ToolButton onClick={() => handleTextAlign('left')}>
            <FaAlignLeft />
          </ToolButton>
          <ToolButton onClick={() => handleTextAlign('center')}>
            <FaAlignCenter />
          </ToolButton>
          <ToolButton onClick={() => handleTextAlign('right')}>
            <FaAlignRight />
          </ToolButton>
        </div>

        <div className="tool-group">
          <ExportButton onClick={handleExportHTML}>
            <FaCode /> Export HTML
          </ExportButton>
          <ExportButton onClick={handleExportPDF}>
            <FaDownload /> Export PDF
          </ExportButton>
          <ExportButton onClick={handleExportImage}>
            <FaImage /> Export Image
          </ExportButton>
        </div>

        <div className="tool-group">
          <ToolButton 
            className={showGrid ? 'active' : ''} 
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
          >
            <FaThLarge />
          </ToolButton>
        </div>
      </Toolbar>

      <MainContent>
        <CanvasContainer className="canvas-container">
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            onClick={handleStageClick}
            style={{ background: canvasBackground }}
          >
            <Layer>
              {showGrid && <Grid width={stageSize.width} height={stageSize.height} />}
              {texts.map((text) => (
                <TextElement
                  key={text.id}
                  id={text.id}
                  text={text}
                  isSelected={text.id === selectedId}
                  onSelect={() => handleSelect(text.id)}
                  onChange={(newProps) => handleTextChange(text.id, newProps)}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                />
              ))}
              {alignmentGuides.map((guide, i) => (
                <SmartGuide key={i} points={guide.points} />
              ))}
            </Layer>
          </Stage>
        </CanvasContainer>

        <SidePanel>
          <h6>Canvas Properties</h6>
          <div className="mb-3">
            <label className="form-label">Background Color</label>
            <input
              type="color"
              className="form-control form-control-color w-100"
              value={canvasBackground}
              onChange={(e) => setCanvasBackground(e.target.value)}
            />
          </div>
          
          <h6>Text Properties</h6>
          {selectedText && (
            <div className="vstack gap-3">
              <div>
                <label className="form-label">Content</label>
                <textarea
                  className="form-control"
                  value={selectedText.content}
                  onChange={(e) => handleTextChange(selectedId, { content: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Font Size</label>
                <input
                  type="number"
                  className="form-control"
                  value={selectedText.fontSize}
                  onChange={(e) => handleTextChange(selectedId, { fontSize: Number(e.target.value) })}
                  min="1"
                  max="200"
                />
              </div>
              <div>
                <label className="form-label">Font Family</label>
                <select
                  className="form-select"
                  value={selectedText.fontFamily}
                  onChange={(e) => handleTextChange(selectedId, { fontFamily: e.target.value })}
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>
              <div>
                <label className="form-label">Color</label>
                <input
                  type="color"
                  className="form-control form-control-color w-100"
                  value={selectedText.color}
                  onChange={(e) => handleTextChange(selectedId, { color: e.target.value })}
                />
              </div>
            </div>
          )}
        </SidePanel>
      </MainContent>
    </EditorContainer>
  );
};

export default CustomDesign;