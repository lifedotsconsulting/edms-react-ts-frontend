import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  EyeOff, 
  Ruler, 
  RotateCcw,
  Download
} from 'lucide-react';
import './CadPreview.css';

interface CadPreviewProps {
  url: string;
  fileName: string;
}

interface Point {
  x: number;
  y: number;
}

interface Layer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
}

const CadPreview: React.FC<CadPreviewProps> = ({ url, fileName }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // CAD Navigation State
  const [zoom, setZoom] = useState<number>(1.2);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<Point>({ x: 0, y: 0 });

  // Coordinates tracker
  const [cadCoords, setCadCoords] = useState<Point>({ x: 0, y: 0 });

  // Measurement State
  const [measureMode, setMeasureMode] = useState<boolean>(false);
  const [measureStart, setMeasureStart] = useState<Point | null>(null);
  const [tempMeasureEnd, setTempMeasureEnd] = useState<Point | null>(null);
  const [savedMeasurements, setSavedMeasurements] = useState<{ p1: Point; p2: Point; distance: string }[]>([]);

  // CAD Layers
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'grid', name: 'Grid Lines', color: '#1f2937', visible: true },
    { id: 'outline', name: 'Outline (Walls/Shell)', color: '#ffffff', visible: true },
    { id: 'hvac', name: 'HVAC Ducting', color: '#0ea5e9', visible: true },
    { id: 'electrical', name: 'Electrical Power', color: '#eab308', visible: true },
    { id: 'annotations', name: 'Text & Labels', color: '#10b981', visible: true },
    { id: 'dimensions', name: 'Dimensions', color: '#ec4899', visible: true },
  ]);

  // Handle auto-fit size on start
  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const resizeCanvas = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (canvas && container) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
          drawCAD();
        }
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [zoom, pan, layers, measureStart, tempMeasureEnd, savedMeasurements, fileName]);

  // Redraw whenever dependencies update
  useEffect(() => {
    drawCAD();
  }, [zoom, pan, layers, measureStart, tempMeasureEnd, savedMeasurements, fileName]);

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l));
  };

  // Convert client pixel position on canvas to CAD world space coordinates
  const screenToWorld = (screenX: number, screenY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    return {
      x: Math.round((screenX - centerX - pan.x) / zoom * 10), // multiplied for scale representation
      y: Math.round((centerY - screenY + pan.y) / zoom * 10)
    };
  };

  // Convert CAD world space coordinates to canvas pixel position
  const worldToScreen = (worldX: number, worldY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    return {
      x: (worldX / 10) * zoom + centerX + pan.x,
      y: centerY - (worldY / 10) * zoom + pan.y
    };
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (measureMode) {
      const worldPoint = screenToWorld(x, y);
      if (!measureStart) {
        setMeasureStart(worldPoint);
      } else {
        // Complete measurement
        const dx = worldPoint.x - measureStart.x;
        const dy = worldPoint.y - measureStart.y;
        const distMM = Math.sqrt(dx * dx + dy * dy);
        
        let distanceStr = '';
        if (fileName.toLowerCase().includes('imperial')) {
          const feet = (distMM / 304.8).toFixed(1);
          distanceStr = `${feet}'`;
        } else {
          const meters = (distMM / 1000).toFixed(2);
          distanceStr = `${meters} m`;
        }

        setSavedMeasurements(prev => [...prev, { p1: measureStart, p2: worldPoint, distance: distanceStr }]);
        setMeasureStart(null);
        setTempMeasureEnd(null);
      }
    } else {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const worldPoint = screenToWorld(x, y);
    setCadCoords(worldPoint);

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    } else if (measureMode && measureStart) {
      setTempMeasureEnd(worldPoint);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    let newZoom = zoom;
    if (e.deltaY < 0) {
      newZoom = Math.min(zoom * zoomFactor, 10);
    } else {
      newZoom = Math.max(zoom / zoomFactor, 0.2);
    }
    setZoom(newZoom);
  };

  const resetViewport = () => {
    setZoom(1.2);
    setPan({ x: 0, y: 0 });
    setSavedMeasurements([]);
    setMeasureStart(null);
    setTempMeasureEnd(null);
  };

  // Drawing Dispatcher
  const drawCAD = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Screen
    ctx.fillStyle = '#040406';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const isGridVisible = layers.find(l => l.id === 'grid')?.visible;
    const isOutlineVisible = layers.find(l => l.id === 'outline')?.visible;
    const isHvacVisible = layers.find(l => l.id === 'hvac')?.visible;
    const isElectVisible = layers.find(l => l.id === 'electrical')?.visible;
    const isAnnVisible = layers.find(l => l.id === 'annotations')?.visible;
    const isDimVisible = layers.find(l => l.id === 'dimensions')?.visible;

    // 1. Draw Grid Lines
    if (isGridVisible) {
      ctx.strokeStyle = '#161b22';
      ctx.lineWidth = 1;
      
      const gridSpacing = 50 * zoom; // dynamic grid based on zoom
      const startX = (pan.x % gridSpacing) + (canvas.width / 2) % gridSpacing;
      const startY = (pan.y % gridSpacing) + (canvas.height / 2) % gridSpacing;

      // Vertical lines
      for (let x = startX - gridSpacing; x < canvas.width + gridSpacing; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = startY - gridSpacing; y < canvas.height + gridSpacing; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Origin axis lines (thick axes)
      const origin = worldToScreen(0, 0);
      ctx.strokeStyle = '#30363d';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(origin.x, 0);
      ctx.lineTo(origin.x, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, origin.y);
      ctx.lineTo(canvas.width, origin.y);
      ctx.stroke();
    }

    // Determine layout category
    const isArchitectural = fileName.toLowerCase().includes('architectural') || 
                            fileName.toLowerCase().includes('civil') || 
                            fileName.toLowerCase().includes('condominium');

    // Drawing Vectors
    if (isArchitectural) {
      // ARCHITECTURAL LAYOUT TEMPLATE
      
      // A. Outline Layer (Walls)
      if (isOutlineVisible) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5 * zoom;
        ctx.lineJoin = 'miter';

        // Outer Building Border
        ctx.beginPath();
        const p1 = worldToScreen(-1500, -1000);
        const p2 = worldToScreen(1500, -1000);
        const p3 = worldToScreen(1500, 1000);
        const p4 = worldToScreen(-1500, 1000);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.stroke();

        // Inner walls (Rooms divider)
        ctx.beginPath();
        // Room 1 (Office)
        const wallA1 = worldToScreen(-500, -1000);
        const wallA2 = worldToScreen(-500, 300);
        ctx.moveTo(wallA1.x, wallA1.y);
        ctx.lineTo(wallA2.x, wallA2.y);
        
        // Room 2 (Conference)
        const wallB1 = worldToScreen(500, 1000);
        const wallB2 = worldToScreen(500, -200);
        ctx.moveTo(wallB1.x, wallB1.y);
        ctx.lineTo(wallB2.x, wallB2.y);

        // Corridor Wall
        const wallC1 = worldToScreen(-1500, 300);
        const wallC2 = worldToScreen(-200, 300);
        ctx.moveTo(wallC1.x, wallC1.y);
        ctx.lineTo(wallC2.x, wallC2.y);

        const wallD1 = worldToScreen(200, -200);
        const wallD2 = worldToScreen(1500, -200);
        ctx.moveTo(wallD1.x, wallD1.y);
        ctx.lineTo(wallD2.x, wallD2.y);
        ctx.stroke();

        // Door Swings (Arc representation)
        ctx.strokeStyle = '#58a6ff';
        ctx.lineWidth = 1 * zoom;
        // Door 1 Office
        const d1 = worldToScreen(-500, 100);
        ctx.beginPath();
        ctx.arc(d1.x, d1.y, 40 * zoom, 0, Math.PI / 2);
        ctx.moveTo(d1.x, d1.y);
        ctx.lineTo(d1.x, d1.y + 40 * zoom);
        ctx.stroke();
        
        // Door 2 Conference
        const d2 = worldToScreen(500, 0);
        ctx.beginPath();
        ctx.arc(d2.x, d2.y, 40 * zoom, Math.PI, Math.PI * 1.5);
        ctx.moveTo(d2.x, d2.y);
        ctx.lineTo(d2.x - 40 * zoom, d2.y);
        ctx.stroke();
      }

      // B. HVAC Ducting Layer (Cyan paths)
      if (isHvacVisible) {
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 4 * zoom;
        ctx.lineCap = 'square';
        
        ctx.beginPath();
        const hv1 = worldToScreen(-1200, 800);
        const hv2 = worldToScreen(1200, 800);
        ctx.moveTo(hv1.x, hv1.y);
        ctx.lineTo(hv2.x, hv2.y);
        
        const hb1 = worldToScreen(-1000, 800);
        const hb2 = worldToScreen(-1000, 0);
        ctx.moveTo(hb1.x, hb1.y);
        ctx.lineTo(hb2.x, hb2.y);

        const hb3 = worldToScreen(800, 800);
        const hb4 = worldToScreen(800, -400);
        ctx.moveTo(hb3.x, hb3.y);
        ctx.lineTo(hb4.x, hb4.y);
        ctx.stroke();

        // Diffusers (cyan boxes with cross)
        ctx.fillStyle = '#0ea5e9';
        ctx.lineWidth = 1.5 * zoom;
        const diffusers = [
          { x: -1000, y: 0 },
          { x: 800, y: -400 },
          { x: 0, y: 800 }
        ];
        diffusers.forEach(df => {
          const pt = worldToScreen(df.x, df.y);
          const sz = 16 * zoom;
          ctx.strokeStyle = '#0ea5e9';
          ctx.strokeRect(pt.x - sz/2, pt.y - sz/2, sz, sz);
          ctx.beginPath();
          ctx.moveTo(pt.x - sz/2, pt.y - sz/2);
          ctx.lineTo(pt.x + sz/2, pt.y + sz/2);
          ctx.moveTo(pt.x + sz/2, pt.y - sz/2);
          ctx.lineTo(pt.x - sz/2, pt.y + sz/2);
          ctx.stroke();
        });
      }

      // C. Electrical Power Layer (Yellow lines & nodes)
      if (isElectVisible) {
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1 * zoom;
        ctx.setLineDash([4 * zoom, 4 * zoom]);
        
        // Outlets connection paths
        ctx.beginPath();
        const el1 = worldToScreen(-1400, -800);
        const el2 = worldToScreen(-600, -800);
        const el3 = worldToScreen(-600, 200);
        ctx.moveTo(el1.x, el1.y);
        ctx.lineTo(el2.x, el2.y);
        ctx.lineTo(el3.x, el3.y);

        const el4 = worldToScreen(1400, 800);
        const el5 = worldToScreen(600, 800);
        const el6 = worldToScreen(600, -100);
        ctx.moveTo(el4.x, el4.y);
        ctx.lineTo(el5.x, el5.y);
        ctx.lineTo(el6.x, el6.y);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Draw electrical symbols (circles with line)
        ctx.fillStyle = '#eab308';
        const powerPoints = [
          { x: -1400, y: -800 },
          { x: -600, y: -800 },
          { x: -600, y: 200 },
          { x: 1400, y: 800 },
          { x: 600, y: 800 },
          { x: 600, y: -100 }
        ];
        powerPoints.forEach(pp => {
          const pt = worldToScreen(pp.x, pp.y);
          const rad = 5 * zoom;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.lineWidth = 1.5 * zoom;
          ctx.strokeStyle = '#eab308';
          ctx.beginPath();
          ctx.moveTo(pt.x - rad * 1.5, pt.y);
          ctx.lineTo(pt.x + rad * 1.5, pt.y);
          ctx.stroke();
        });
      }

      // D. Text & Labels Layer (Green labels)
      if (isAnnVisible) {
        ctx.fillStyle = '#10b981';
        ctx.font = `${Math.max(10, Math.round(14 * zoom))}px monospace`;
        ctx.textAlign = 'center';

        const labels = [
          { name: 'MAIN OFFICE A', x: -1000, y: -300 },
          { name: 'CONFERENCE ROOM B', x: 1000, y: 300 },
          { name: 'CORRIDOR C', x: 0, y: 0 },
          { name: 'BUILDING LOBBY', x: 0, y: -800 }
        ];

        labels.forEach(lb => {
          const pt = worldToScreen(lb.x, lb.y);
          ctx.fillText(lb.name, pt.x, pt.y);
        });

        // Drawing stamp block bottom right
        ctx.textAlign = 'left';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1 * zoom;
        const stamp = worldToScreen(800, -700);
        const w = 600 * (zoom / 10);
        const h = 250 * (zoom / 10);
        
        ctx.strokeRect(stamp.x, stamp.y, w, h);
        ctx.font = `${Math.max(8, Math.round(10 * zoom))}px monospace`;
        ctx.fillText('CLIENT: RESONAC CORP.', stamp.x + 10 * zoom, stamp.y + 40 * zoom);
        ctx.fillText(`DWG NO: ${fileName.split('.')[0].toUpperCase()}`, stamp.x + 10 * zoom, stamp.y + 100 * zoom);
        ctx.fillText('STATUS: ISSUED FOR APPROVAL', stamp.x + 10 * zoom, stamp.y + 160 * zoom);
      }

      // E. Dimensions Layer (Pink Dimension Marks)
      if (isDimVisible) {
        ctx.strokeStyle = '#ec4899';
        ctx.fillStyle = '#ec4899';
        ctx.lineWidth = 1 * zoom;
        ctx.font = `${Math.max(9, Math.round(11 * zoom))}px monospace`;
        ctx.textAlign = 'center';

        // Dimension 1: Main Width (top)
        const dimLeft = worldToScreen(-1500, 1150);
        const dimRight = worldToScreen(1500, 1150);
        
        ctx.beginPath();
        ctx.moveTo(dimLeft.x, dimLeft.y);
        ctx.lineTo(dimRight.x, dimRight.y);
        ctx.stroke();

        // Tick marks
        ctx.beginPath();
        ctx.moveTo(dimLeft.x, dimLeft.y - 8 * zoom); ctx.lineTo(dimLeft.x, dimLeft.y + 8 * zoom);
        ctx.moveTo(dimRight.x, dimRight.y - 8 * zoom); ctx.lineTo(dimRight.x, dimRight.y + 8 * zoom);
        ctx.stroke();
        
        // Label
        ctx.fillText("30.0 m (100.0')", (dimLeft.x + dimRight.x) / 2, dimLeft.y - 8 * zoom);

        // Dimension 2: Main Height (left)
        const dimTop = worldToScreen(-1650, 1000);
        const dimBot = worldToScreen(-1650, -1000);

        ctx.beginPath();
        ctx.moveTo(dimTop.x, dimTop.y);
        ctx.lineTo(dimBot.x, dimBot.y);
        ctx.stroke();

        // Tick marks
        ctx.beginPath();
        ctx.moveTo(dimTop.x - 8 * zoom, dimTop.y); ctx.lineTo(dimTop.x + 8 * zoom, dimTop.y);
        ctx.moveTo(dimBot.x - 8 * zoom, dimBot.y); ctx.lineTo(dimBot.x + 8 * zoom, dimBot.y);
        ctx.stroke();

        // Label
        ctx.save();
        ctx.translate(dimTop.x - 10 * zoom, (dimTop.y + dimBot.y) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("20.0 m (65.6')", 0, 0);
        ctx.restore();
      }

    } else {
      // MECHANICAL / SCHEMATICS / BLOCKS TEMPLATE
      
      // A. Outline Layer
      if (isOutlineVisible) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 * zoom;

        // Draw mechanical gears/flange outline
        const center = worldToScreen(0, 0);
        
        // Outer circular flange
        ctx.beginPath();
        ctx.arc(center.x, center.y, 180 * zoom, 0, Math.PI * 2);
        ctx.stroke();

        // Inner core
        ctx.beginPath();
        ctx.arc(center.x, center.y, 80 * zoom, 0, Math.PI * 2);
        ctx.stroke();

        // Mounting holes in circle flange (PCD)
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.setLineDash([6 * zoom, 4 * zoom]);
        ctx.beginPath();
        ctx.arc(center.x, center.y, 130 * zoom, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Keyway details
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        const kw1 = worldToScreen(-30, 74);
        const kw2 = worldToScreen(-30, 100);
        const kw3 = worldToScreen(30, 100);
        const kw4 = worldToScreen(30, 74);
        ctx.moveTo(kw1.x, kw1.y);
        ctx.lineTo(kw2.x, kw2.y);
        ctx.lineTo(kw3.x, kw3.y);
        ctx.lineTo(kw4.x, kw4.y);
        ctx.stroke();

        // Outer notches/teeth (simplified gear notches)
        ctx.lineWidth = 2.5 * zoom;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
          const innerR = 180;
          const outerR = 205;
          const pt1 = worldToScreen(Math.cos(a - 0.1) * innerR, Math.sin(a - 0.1) * innerR);
          const pt2 = worldToScreen(Math.cos(a - 0.05) * outerR, Math.sin(a - 0.05) * outerR);
          const pt3 = worldToScreen(Math.cos(a + 0.05) * outerR, Math.sin(a + 0.05) * outerR);
          const pt4 = worldToScreen(Math.cos(a + 0.1) * innerR, Math.sin(a + 0.1) * innerR);

          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.lineTo(pt3.x, pt3.y);
          ctx.lineTo(pt4.x, pt4.y);
          ctx.stroke();
        }
      }

      // B. HVAC Layer (Fluid cooling tubes)
      if (isHvacVisible) {
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 3 * zoom;
        // Circular cooling channel
        const center = worldToScreen(0, 0);
        ctx.beginPath();
        ctx.arc(center.x, center.y, 40 * zoom, 0, Math.PI * 2);
        ctx.stroke();

        // Feed line
        ctx.beginPath();
        const f1 = worldToScreen(-300, 0);
        const f2 = worldToScreen(-40, 0);
        ctx.moveTo(f1.x, f1.y);
        ctx.lineTo(f2.x, f2.y);
        ctx.stroke();
      }

      // C. Electrical Layer (Circuit switch diagram)
      if (isElectVisible) {
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5 * zoom;
        
        const base = worldToScreen(-250, -200);
        const end = worldToScreen(250, -200);

        ctx.beginPath();
        ctx.moveTo(base.x, base.y);
        ctx.lineTo(base.x + 100 * zoom, base.y);
        
        // Open switch representation
        ctx.lineTo(base.x + 180 * zoom, base.y - 40 * zoom);
        
        ctx.moveTo(base.x + 200 * zoom, base.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Switch nodes
        ctx.fillStyle = '#eab308';
        const node1 = worldToScreen(-150, -200);
        const node2 = worldToScreen(-50, -200);
        [node1, node2].forEach(n => {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 4 * zoom, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // D. Text & Labels
      if (isAnnVisible) {
        ctx.fillStyle = '#10b981';
        ctx.font = `${Math.max(10, Math.round(13 * zoom))}px monospace`;
        ctx.textAlign = 'center';

        const flangeCenter = worldToScreen(0, -250);
        ctx.fillText('ROTATIONAL COUPLING FLANGE', flangeCenter.x, flangeCenter.y);
        
        const partLbl = worldToScreen(0, 150);
        ctx.fillText('PART REF: RCN-9092', partLbl.x, partLbl.y);

        // Stamp
        ctx.textAlign = 'left';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1 * zoom;
        const stamp = worldToScreen(250, 250);
        const w = 450 * (zoom / 10);
        const h = 200 * (zoom / 10);
        
        ctx.strokeRect(stamp.x, stamp.y, w, h);
        ctx.font = `${Math.max(8, Math.round(9 * zoom))}px monospace`;
        ctx.fillText('DEPT: MECHANICAL DESIGN', stamp.x + 10 * zoom, stamp.y + 40 * zoom);
        ctx.fillText(`FILE: ${fileName}`, stamp.x + 10 * zoom, stamp.y + 100 * zoom);
        ctx.fillText('MATERIAL: SUS304 STAINLESS', stamp.x + 10 * zoom, stamp.y + 160 * zoom);
      }

      // E. Dimensions Layer
      if (isDimVisible) {
        ctx.strokeStyle = '#ec4899';
        ctx.fillStyle = '#ec4899';
        ctx.lineWidth = 1 * zoom;
        ctx.font = `${Math.max(9, Math.round(11 * zoom))}px monospace`;
        ctx.textAlign = 'left';

        // Radial dimension line
        const startPt = worldToScreen(0, 0);
        const endPt = worldToScreen(Math.cos(Math.PI / 4) * 180, Math.sin(Math.PI / 4) * 180);
        
        ctx.beginPath();
        ctx.moveTo(startPt.x, startPt.y);
        ctx.lineTo(endPt.x, endPt.y);
        ctx.stroke();

        // Arrow tick on outer circle
        ctx.beginPath();
        ctx.arc(endPt.x, endPt.y, 4 * zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillText('R 180.0 mm', endPt.x + 10 * zoom, endPt.y + 5 * zoom);

        // Core Diameter Dimension
        const coreLeft = worldToScreen(-80, -30);
        const coreRight = worldToScreen(80, -30);
        ctx.beginPath();
        ctx.moveTo(coreLeft.x, coreLeft.y);
        ctx.lineTo(coreRight.x, coreRight.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(coreLeft.x, coreLeft.y - 5 * zoom); ctx.lineTo(coreLeft.x, coreLeft.y + 5 * zoom);
        ctx.moveTo(coreRight.x, coreRight.y - 5 * zoom); ctx.lineTo(coreRight.x, coreRight.y + 5 * zoom);
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillText('Ø 160.0 mm', (coreLeft.x + coreRight.x) / 2, coreLeft.y - 8 * zoom);
      }
    }

    // 3. Draw Saved Measurements
    ctx.lineWidth = 1.5 * zoom;
    ctx.strokeStyle = '#ec4899';
    ctx.fillStyle = '#ec4899';
    ctx.font = `${Math.max(10, Math.round(12 * zoom))}px monospace`;
    ctx.textAlign = 'center';

    savedMeasurements.forEach(meas => {
      const sp = worldToScreen(meas.p1.x, meas.p1.y);
      const ep = worldToScreen(meas.p2.x, meas.p2.y);

      // Line
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.lineTo(ep.x, ep.y);
      ctx.stroke();

      // Start/End nodes
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 4 * zoom, 0, Math.PI * 2);
      ctx.arc(ep.x, ep.y, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Text label offset
      const textX = (sp.x + ep.x) / 2;
      const textY = (sp.y + ep.y) / 2 - 10 * zoom;
      ctx.fillText(`d = ${meas.distance}`, textX, textY);
    });

    // 4. Draw Temp Measurement Line (if active)
    if (measureMode && measureStart && tempMeasureEnd) {
      const sp = worldToScreen(measureStart.x, measureStart.y);
      const ep = worldToScreen(tempMeasureEnd.x, tempMeasureEnd.y);

      ctx.strokeStyle = '#eab308';
      ctx.fillStyle = '#eab308';
      ctx.setLineDash([4 * zoom, 4 * zoom]);
      ctx.lineWidth = 1.5 * zoom;

      // Line
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.lineTo(ep.x, ep.y);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Nodes
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 4 * zoom, 0, Math.PI * 2);
      ctx.arc(ep.x, ep.y, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Temp value
      const dx = tempMeasureEnd.x - measureStart.x;
      const dy = tempMeasureEnd.y - measureStart.y;
      const distMM = Math.sqrt(dx * dx + dy * dy);
      
      let distanceStr = '';
      if (fileName.toLowerCase().includes('imperial')) {
        const feet = (distMM / 304.8).toFixed(1);
        distanceStr = `${feet}'`;
      } else {
        const meters = (distMM / 1000).toFixed(2);
        distanceStr = `${meters} m`;
      }

      ctx.fillText(distanceStr, (sp.x + ep.x) / 2, (sp.y + ep.y) / 2 - 10 * zoom);
    }
  };

  return (
    <div className="cad-preview-wrapper" ref={containerRef}>
      {/* CAD Control Toolbar */}
      <div className="cad-toolbar">
        <div className="cad-tools-left">
          <span className="cad-file-badge">CAD VIEW</span>
          <span className="text-xs font-semibold" style={{ color: '#8b949e', marginLeft: '0.25rem' }}>
            {fileName}
          </span>
        </div>
        
        <div className="cad-tools-right">
          <button 
            className="cad-btn" 
            onClick={() => setZoom(z => Math.min(z * 1.2, 10))} 
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button 
            className="cad-btn" 
            onClick={() => setZoom(z => Math.max(z / 1.2, 0.2))} 
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button 
            className="cad-btn" 
            onClick={resetViewport} 
            title="Recenter"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
          <button 
            className={`cad-btn ${measureMode ? 'active' : ''}`}
            onClick={() => {
              setMeasureMode(!measureMode);
              setMeasureStart(null);
              setTempMeasureEnd(null);
            }}
            title="Measure Tool"
          >
            <Ruler size={14} />
            <span>{measureMode ? 'Cancel Measure' : 'Measure'}</span>
          </button>
          <a 
            href={url}
            download={fileName}
            className="cad-btn"
            title="Download CAD File"
            style={{ textDecoration: 'none' }}
          >
            <Download size={14} />
            <span>Download</span>
          </a>
        </div>
      </div>

      <div className="cad-body">
        {/* CAD Canvas Viewer */}
        <div className="cad-canvas-wrapper">
          {measureMode && (
            <div className="cad-instruction-overlay">
              {!measureStart ? 'Click to select first point' : 'Click to select endpoint'}
            </div>
          )}
          
          <canvas
            ref={canvasRef}
            className="cad-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
          
          {/* Real-time coordinates readout */}
          <div className="cad-coords-overlay">
            <span className="coords-label">X: </span>{(cadCoords.x / 10).toFixed(2)} mm | <span className="coords-label">Y: </span>{(cadCoords.y / 10).toFixed(2)} mm
          </div>
        </div>

        {/* Sidebar CAD Layers Controller */}
        <div className="cad-layers-drawer">
          <div className="layers-header">CAD Layers</div>
          <div className="layers-list">
            {layers.map(layer => (
              <div key={layer.id} className="layer-item">
                <div className="layer-info">
                  <span className="layer-color-dot" style={{ backgroundColor: layer.color }} />
                  <span>{layer.name}</span>
                </div>
                <button 
                  className={`layer-toggle-btn ${layer.visible ? 'active' : ''}`}
                  onClick={() => toggleLayer(layer.id)}
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadPreview;
