'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Package, Download, AlertCircle, Image as ImageIcon, Play, Square, Move, ChevronLeft, ChevronRight, Layers, Undo2, Trash2, User, AlignCenterHorizontal, AlignEndHorizontal, Plus, Copy, Settings2 } from 'lucide-react';
import '../../globals.css';

export default function VisualEffectPacker() {
  const [image, setImage] = useState(null);
  const [sprites, setSprites] = useState([]);
  
  const [framesStr, setFramesStr] = useState('[]');
  const [animationsStr, setAnimationsStr] = useState('[]');
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState(null);
  const [error, setError] = useState('');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAnimIndex, setCurrentAnimIndex] = useState(0); 
  
  const [isPreviewDragging, setIsPreviewDragging] = useState(false);
  const [previewDragStart, setPreviewDragStart] = useState({ x: 0, y: 0 });

  const [showOnionSkin, setShowOnionSkin] = useState(true);
  const [showPlayerDummy, setShowPlayerDummy] = useState(true);
  const [baseZoom, setBaseZoom] = useState(4); 
  const [targetZoom, setTargetZoom] = useState(4); 

  // --- NEW ADVANCED FEATURES STATE ---
  const [autoFrameMode, setAutoFrameMode] = useState(true);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(null); // Chỉ mục của phần tử đang được chọn trong Frame hiện tại
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [dummyImage, setDummyImage] = useState(null);
  const [dummyScale, setDummyScale] = useState(1);

  const handleDummyUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setDummyImage(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const requestRef = useRef();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const newImg = new Image();
      newImg.onload = () => {
        if (!image) {
          setImage(newImg);
          setSprites([]); setFramesStr('[]'); setAnimationsStr('[]');
          setCurrentAnimIndex(0); setSelectedLayerIndex(null);
        } else {
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(image.width, newImg.width);
          canvas.height = image.height + newImg.height + 1;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0);
          ctx.drawImage(newImg, 0, image.height + 1);
          
          const mergedImg = new Image();
          mergedImg.onload = () => setImage(mergedImg);
          mergedImg.src = canvas.toDataURL('image/png');
        }
      };
      newImg.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleDownloadImage = () => {
    if (!image || sprites.length === 0) {
      setError('Hãy cắt ít nhất 1 mảnh (Sprite) để lưu ảnh!');
      return;
    }
    
    const scaleMultiplier = targetZoom / baseZoom;
    let currentX = 0;
    let currentY = 0;
    let rowHeight = 0;
    const maxWidth = 800;
    const packed = [];
    
    for (let s of sprites) {
       const w = Math.round(s.w * scaleMultiplier);
       const h = Math.round(s.h * scaleMultiplier);
       if (currentX + w > maxWidth && currentX > 0) {
           currentX = 0;
           currentY += rowHeight + 1;
           rowHeight = 0;
       }
       packed.push({ original: s, x: currentX, y: currentY, w, h });
       currentX += w + 1;
       rowHeight = Math.max(rowHeight, h);
    }
    
    const finalWidth = packed.length > 0 ? Math.max(...packed.map(p => p.x + p.w)) : 1;
    const finalHeight = packed.length > 0 ? Math.max(...packed.map(p => p.y + p.h)) : 1;
    
    const canvas = document.createElement('canvas');
    canvas.width = finalWidth;
    canvas.height = finalHeight;
    const ctx = canvas.getContext('2d');
    
    packed.forEach(p => {
       ctx.drawImage(image, p.original.x, p.original.y, p.original.w, p.original.h, p.x, p.y, p.w, p.h);
    });
    
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `ImgEffect_Custom_X${targetZoom}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(image, 0, 0);
      
      sprites.forEach((sprite, index) => {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.strokeRect(sprite.x, sprite.y, sprite.w, sprite.h);
        
        ctx.fillStyle = '#10b981';
        ctx.fillRect(sprite.x, sprite.y - 14, 20, 14);
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.fillText(`ID:${index}`, sprite.x + 2, sprite.y - 4);
      });

      if (currentRect) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 2]);
        ctx.strokeRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
        ctx.setLineDash([]);
      }
    }
  }, [image, sprites, currentRect]);

  useEffect(() => {
    if (image && previewCanvasRef.current) {
      let frames = [];
      let animations = [];
      try {
        frames = JSON.parse(framesStr);
        animations = JSON.parse(animationsStr);
      } catch(e) { }

      const ctx = previewCanvasRef.current.getContext('2d');
      let lastDrawTime = Date.now();
      
      const drawFrame = () => {
        const now = Date.now();
        if (!isPlaying || now - lastDrawTime > 150) {
          ctx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
          
          ctx.strokeStyle = 'rgba(255,255,255,0.05)';
          ctx.beginPath();
          for(let i=0; i<=500; i+=20) {
            ctx.moveTo(i, 0); ctx.lineTo(i, 500);
            ctx.moveTo(0, i); ctx.lineTo(500, i);
          }
          ctx.stroke();

          ctx.strokeStyle = 'rgba(255,50,50,0.5)';
          ctx.beginPath();
          ctx.moveTo(250, 0); ctx.lineTo(250, 500);
          ctx.moveTo(0, 250); ctx.lineTo(500, 250);
          ctx.stroke();

          if (showPlayerDummy) {
             ctx.save();
             ctx.translate(250, 250);
             ctx.scale(dummyScale, dummyScale);

             if (dummyImage) {
               ctx.drawImage(dummyImage, -Math.floor(dummyImage.width / 2), -Math.floor(dummyImage.height / 2));
             } else {
               ctx.translate(-250, -250);
               ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
               ctx.beginPath();
               ctx.arc(250, 235, 10, 0, Math.PI * 2);
               ctx.fill();
               ctx.fillRect(242, 247, 16, 18);
               ctx.fillRect(242, 265, 6, 10);
               ctx.fillRect(252, 265, 6, 10);
               ctx.fillRect(234, 247, 6, 14);
               ctx.fillRect(260, 247, 6, 14);
             }

             ctx.restore();
           }

          const scaleMultiplier = targetZoom / baseZoom;
          ctx.imageSmoothingEnabled = false;

          if (animations.length > 0 && frames.length > 0) {
             let validIndex = currentAnimIndex;
             if (validIndex >= animations.length) validIndex = 0;

             if (!isPlaying && showOnionSkin && validIndex > 0) {
                 const prevFrameIndex = animations[validIndex - 1];
                 const prevElements = frames[prevFrameIndex];
                 if (prevElements) {
                     ctx.globalAlpha = 0.3;
                     prevElements.forEach(el => {
                         const sprite = sprites[el.spriteId];
                         if (sprite) {
                             ctx.drawImage(
                               image, sprite.x, sprite.y, sprite.w, sprite.h, 
                               250 + el.dx * scaleMultiplier, 250 + el.dy * scaleMultiplier, sprite.w * scaleMultiplier, sprite.h * scaleMultiplier 
                             );
                         }
                     });
                     ctx.globalAlpha = 1.0; 
                 }
             }

             const frameIndex = animations[validIndex];
             const frameElements = frames[frameIndex];

             if (frameElements) {
               frameElements.forEach((el, idx) => {
                 const sprite = sprites[el.spriteId];
                 if (sprite) {
                   ctx.drawImage(
                     image,
                     sprite.x, sprite.y, sprite.w, sprite.h, 
                     250 + el.dx * scaleMultiplier, 250 + el.dy * scaleMultiplier, sprite.w * scaleMultiplier, sprite.h * scaleMultiplier 
                   );
                   // Vẽ viền layer đang chọn
                   if (idx === selectedLayerIndex && !isPlaying) {
                     ctx.strokeStyle = '#3b82f6';
                     ctx.lineWidth = 1;
                     ctx.setLineDash([4, 2]);
                     ctx.strokeRect(250 + el.dx * scaleMultiplier, 250 + el.dy * scaleMultiplier, sprite.w * scaleMultiplier, sprite.h * scaleMultiplier);
                     ctx.setLineDash([]);
                   }
                 }
               });
             }
          } else {
             ctx.fillStyle = '#a1a1aa';
             ctx.font = '14px Arial';
             ctx.fillText('Chưa có Animation', 90, 155);
          }

          if(isPlaying) {
             lastDrawTime = now;
             setCurrentAnimIndex(prev => (prev + 1) % Math.max(1, animations.length));
          }
        }
        requestRef.current = requestAnimationFrame(drawFrame);
      };

      requestRef.current = requestAnimationFrame(drawFrame);
      return () => cancelAnimationFrame(requestRef.current);
    }
  }, [isPlaying, image, sprites, framesStr, animationsStr, currentAnimIndex, showOnionSkin, showPlayerDummy, selectedLayerIndex, targetZoom, baseZoom, dummyImage, dummyScale]);

  const handleMouseDown = (e) => {
    if (!image) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / canvasZoom);
    const y = Math.round((e.clientY - rect.top) / canvasZoom);
    setStartPos({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / canvasZoom);
    const y = Math.round((e.clientY - rect.top) / canvasZoom);
    setCurrentRect({
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      w: Math.abs(x - startPos.x),
      h: Math.abs(y - startPos.y),
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const confirmCut = useCallback(() => {
    if (currentRect && currentRect.w > 0 && currentRect.h > 0) {
      const newSprites = [...sprites, { id: sprites.length, ...currentRect }];
      setSprites(newSprites);
      
      if (autoFrameMode) {
        try {
          const currentFrames = framesStr.trim() === '[]' || !framesStr ? [] : JSON.parse(framesStr);
          currentFrames.push([{ dx: -Math.floor(currentRect.w/2), dy: -Math.floor(currentRect.h/2), spriteId: newSprites.length - 1 }]);
          setFramesStr(JSON.stringify(currentFrames, null, 2));

          const currentAnimations = animationsStr.trim() === '[]' || !animationsStr ? [] : JSON.parse(animationsStr);
          currentAnimations.push(currentFrames.length - 1);
          setAnimationsStr(JSON.stringify(currentAnimations));
          
          setCurrentAnimIndex(currentAnimations.length - 1);
          setSelectedLayerIndex(0);
        } catch(e){}
      }
      setCurrentRect(null);
    }
  }, [currentRect, sprites, autoFrameMode, framesStr, animationsStr]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
        confirmCut();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmCut]);

  const handleUndo = () => {
    if (sprites.length === 0) return;
    setIsPlaying(false);
    const newSprites = sprites.slice(0, -1);
    setSprites(newSprites);
    
    if (autoFrameMode) {
      try {
        const currentFrames = framesStr.trim() === '[]' || !framesStr ? [] : JSON.parse(framesStr);
        const currentAnimations = animationsStr.trim() === '[]' || !animationsStr ? [] : JSON.parse(animationsStr);
        if (currentFrames.length > 0) currentFrames.pop();
        if (currentAnimations.length > 0) currentAnimations.pop();
        setFramesStr(JSON.stringify(currentFrames, null, 2));
        setAnimationsStr(JSON.stringify(currentAnimations));
        setCurrentAnimIndex(Math.max(0, currentAnimations.length - 1));
        setSelectedLayerIndex(0);
      } catch(e) {}
    }
  };

  const handleClearAll = () => {
    setSprites([]); setFramesStr('[]'); setAnimationsStr('[]');
    setCurrentAnimIndex(0); setIsPlaying(false); setSelectedLayerIndex(null);
  };

  const handleClearImage = () => {
    setImage(null);
    setCurrentRect(null);
    handleClearAll();
  };

  const handlePreviewMouseDown = (e) => {
    setIsPlaying(false); 
    const rect = previewCanvasRef.current.getBoundingClientRect();
    setPreviewDragStart({
      x: Math.round((e.clientX - rect.left) / previewZoom),
      y: Math.round((e.clientY - rect.top) / previewZoom)
    });
    setIsPreviewDragging(true);
  };

  const handlePreviewMouseMove = (e) => {
    if (!isPreviewDragging) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const currentX = Math.round((e.clientX - rect.left) / previewZoom);
    const currentY = Math.round((e.clientY - rect.top) / previewZoom);
    const diffX = currentX - previewDragStart.x;
    const diffY = currentY - previewDragStart.y;

    try {
      const frames = JSON.parse(framesStr);
      const animations = JSON.parse(animationsStr);
      if (animations.length > 0) {
        let validIndex = currentAnimIndex;
        if (validIndex >= animations.length) validIndex = 0;
        const frameIndex = animations[validIndex];
        
        if (frames[frameIndex]) {
          if (selectedLayerIndex !== null && frames[frameIndex][selectedLayerIndex]) {
            // Drag only the selected part
            frames[frameIndex][selectedLayerIndex].dx += diffX;
            frames[frameIndex][selectedLayerIndex].dy += diffY;
          } else {
            // Drag entire frame
            frames[frameIndex].forEach(el => { el.dx += diffX; el.dy += diffY; });
          }
          setFramesStr(JSON.stringify(frames, null, 2));
        }
      }
    } catch(err){}
    setPreviewDragStart({ x: currentX, y: currentY });
  };

  const handlePreviewMouseUp = () => setIsPreviewDragging(false);
  
  const alignFrame = (type) => {
    try {
      const frames = JSON.parse(framesStr);
      const animations = JSON.parse(animationsStr);
      if (animations.length === 0) return;
      
      let validIndex = currentAnimIndex;
      if (validIndex >= animations.length) validIndex = 0;
      const frameIndex = animations[validIndex];
      
      if (frames[frameIndex]) {
        if (selectedLayerIndex !== null && frames[frameIndex][selectedLayerIndex]) {
            const el = frames[frameIndex][selectedLayerIndex];
            const sprite = sprites[el.spriteId];
            if (sprite) {
                if (type === 'center') {
                    el.dx = -Math.floor(sprite.w / 2);
                    el.dy = -Math.floor(sprite.h / 2);
                }
            }
        } else {
            frames[frameIndex].forEach(el => {
                const sprite = sprites[el.spriteId];
                if (sprite) {
                    if (type === 'center') {
                        el.dx = -Math.floor(sprite.w / 2);
                        el.dy = -Math.floor(sprite.h / 2);
                    }
                }
            });
        }
        setFramesStr(JSON.stringify(frames, null, 2));
      }
    } catch(err){}
  };

  // --- ADVANCED TIMELINE LOGIC ---
  const addEmptyFrame = () => {
    try {
      const currentFrames = framesStr.trim() === '[]' || !framesStr ? [] : JSON.parse(framesStr);
      currentFrames.push([]); // Khung hình rỗng
      setFramesStr(JSON.stringify(currentFrames, null, 2));

      const currentAnimations = animationsStr.trim() === '[]' || !animationsStr ? [] : JSON.parse(animationsStr);
      currentAnimations.push(currentFrames.length - 1);
      setAnimationsStr(JSON.stringify(currentAnimations));
      
      setCurrentAnimIndex(currentAnimations.length - 1);
      setSelectedLayerIndex(null);
    } catch(e){}
  };

  const cloneCurrentFrame = () => {
    try {
      const currentFrames = framesStr.trim() === '[]' || !framesStr ? [] : JSON.parse(framesStr);
      const currentAnimations = animationsStr.trim() === '[]' || !animationsStr ? [] : JSON.parse(animationsStr);
      
      if (currentAnimations.length === 0) return;
      let validIndex = currentAnimIndex;
      if (validIndex >= currentAnimations.length) validIndex = 0;
      
      const frameIndexToClone = currentAnimations[validIndex];
      const clonedParts = JSON.parse(JSON.stringify(currentFrames[frameIndexToClone]));
      
      currentFrames.push(clonedParts);
      setFramesStr(JSON.stringify(currentFrames, null, 2));

      currentAnimations.push(currentFrames.length - 1);
      setAnimationsStr(JSON.stringify(currentAnimations));
      
      setCurrentAnimIndex(currentAnimations.length - 1);
    } catch(e){}
  };

  const addPartToCurrentFrame = (spriteId) => {
    try {
      const currentFrames = framesStr.trim() === '[]' || !framesStr ? [] : JSON.parse(framesStr);
      const currentAnimations = animationsStr.trim() === '[]' || !animationsStr ? [] : JSON.parse(animationsStr);
      
      if (currentAnimations.length === 0) {
        addEmptyFrame(); // Sẽ chạy async nên phải tạm fix bằng cách gọi logic thủ công
        currentFrames.push([{ dx: 0, dy: 0, spriteId }]);
        setFramesStr(JSON.stringify(currentFrames, null, 2));
        currentAnimations.push(currentFrames.length - 1);
        setAnimationsStr(JSON.stringify(currentAnimations));
        setCurrentAnimIndex(currentAnimations.length - 1);
        setSelectedLayerIndex(0);
        return;
      }
      
      let validIndex = currentAnimIndex;
      if (validIndex >= currentAnimations.length) validIndex = 0;
      const frameIndex = currentAnimations[validIndex];
      
      currentFrames[frameIndex].push({ dx: 0, dy: 0, spriteId });
      setFramesStr(JSON.stringify(currentFrames, null, 2));
      setSelectedLayerIndex(currentFrames[frameIndex].length - 1);
    } catch(e){}
  };

  const removePartFromCurrentFrame = (layerIndex) => {
    try {
      const currentFrames = framesStr.trim() === '[]' || !framesStr ? [] : JSON.parse(framesStr);
      const currentAnimations = animationsStr.trim() === '[]' || !animationsStr ? [] : JSON.parse(animationsStr);
      if (currentAnimations.length === 0) return;
      
      let validIndex = currentAnimIndex;
      if (validIndex >= currentAnimations.length) validIndex = 0;
      const frameIndex = currentAnimations[validIndex];
      
      currentFrames[frameIndex].splice(layerIndex, 1);
      setFramesStr(JSON.stringify(currentFrames, null, 2));
      setSelectedLayerIndex(null);
    } catch(e){}
  };

  const goPrevFrame = () => {
      setIsPlaying(false);
      try {
        const anims = JSON.parse(animationsStr);
        if (anims.length === 0) return;
        setCurrentAnimIndex(prev => (prev === 0 ? anims.length - 1 : prev - 1));
        setSelectedLayerIndex(null);
      } catch(e) {}
  };
  
  const goNextFrame = () => {
      setIsPlaying(false);
      try {
        const anims = JSON.parse(animationsStr);
        if (anims.length === 0) return;
        setCurrentAnimIndex(prev => (prev + 1) % anims.length);
        setSelectedLayerIndex(null);
      } catch(e) {}
  };

  const handlePack = async () => {
    try {
      setError('');
      if (sprites.length === 0) throw new Error('Vui lòng cắt ít nhất 1 sprite!');
      
      const parsedFrames = JSON.parse(framesStr);
      const parsedAnimations = JSON.parse(animationsStr);
      const scaleMultiplier = targetZoom / baseZoom;

      let currentX = 0;
      let currentY = 0;
      let rowHeight = 0;
      const maxWidth = 800;
      const packedSprites = [];
      
      for (let s of sprites) {
         const w = Math.round(s.w * scaleMultiplier);
         const h = Math.round(s.h * scaleMultiplier);
         if (currentX + w > maxWidth && currentX > 0) {
             currentX = 0;
             currentY += rowHeight + 1;
             rowHeight = 0;
         }
         packedSprites.push({ id: s.id, x: currentX, y: currentY, w, h });
         currentX += w + 1;
         rowHeight = Math.max(rowHeight, h);
      }

      const payload = {
        version: 221,
        sprites: packedSprites,
        frames: parsedFrames.map(frameArr => frameArr.map(el => ({
            ...el,
            dx: Math.round(el.dx * scaleMultiplier),
            dy: Math.round(el.dy * scaleMultiplier)
        }))),
        animations: parsedAnimations
      };

      const response = await fetch('/api/effect-packer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Lỗi khi tạo file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DataEffect_Custom_X${targetZoom}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownloadJSON = () => {
    try {
      setError('');
      if (sprites.length === 0) throw new Error('Vui lòng cắt ít nhất 1 sprite!');
      
      const parsedFrames = JSON.parse(framesStr);
      const parsedAnimations = JSON.parse(animationsStr);
      const scaleMultiplier = targetZoom / baseZoom;

      const payload = {
        sprites: sprites.map(s => ({
            id: s.id,
            x: Math.round(s.x * scaleMultiplier),
            y: Math.round(s.y * scaleMultiplier),
            w: Math.round(s.w * scaleMultiplier),
            h: Math.round(s.h * scaleMultiplier)
        })),
        frames: parsedFrames.map(frameArr => frameArr.map(el => ({
            ...el,
            dx: Math.round(el.dx * scaleMultiplier),
            dy: Math.round(el.dy * scaleMultiplier)
        }))),
        animations: parsedAnimations
      };

      const blob = new Blob([JSON.stringify(payload, null, 4)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DataEffect_Custom_X${targetZoom}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    }
  };

  let totalAnims = 0;
  let currentFrameParts = [];
  try {
     const anims = JSON.parse(animationsStr);
     totalAnims = anims.length;
     const frames = JSON.parse(framesStr);
     if (totalAnims > 0) {
         let validIndex = currentAnimIndex;
         if (validIndex >= totalAnims) validIndex = 0;
         currentFrameParts = frames[anims[validIndex]] || [];
     }
  } catch(e) {}

  return (
    <div style={{ padding: '20px', maxWidth: '1600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <Package size={28} />
            Visual Effect Packer <span style={{fontSize: '14px', background: '#3b82f6', padding: '2px 8px', borderRadius: '4px', color: 'white'}}>Pro</span>
          </h1>
          <p className="subtitle" style={{ margin: '8px 0 0 0' }}>Tạo Hào quang đơn giản & Hiệu ứng Rồng ghép mảnh phức tạp</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--glass-bg)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <Settings2 size={20} color="#10b981"/>
            <span style={{ fontSize: '0.9rem', color: '#e4e4e7' }}>Chế độ thông minh (Auto-Frame):</span>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={autoFrameMode} onChange={(e) => setAutoFrameMode(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: autoFrameMode ? '#10b981' : '#a1a1aa' }}>{autoFrameMode ? 'BẬT (Phù hợp Aura)' : 'TẮT (Phù hợp Ghép Boss)'}</span>
            </label>
        </div>
      </header>

      {error && (
        <div className="glass-panel" style={{ borderLeft: '4px solid #ef4444', marginBottom: '16px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle color="#ef4444" />
            <p style={{ margin: 0, color: '#ef4444' }}>{error}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 350px', gap: '20px' }}>
        {/* CỘT 1: CẮT ẢNH & KHO SPRITE */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              1. Sprite Sheet
              <select value={canvasZoom} onChange={(e) => setCanvasZoom(Number(e.target.value))} style={{ background: '#27272a', color: '#10b981', border: '1px solid #3f3f46', borderRadius: '4px', fontSize: '0.8rem', padding: '2px 4px', cursor: 'pointer' }}>
                <option value={1}>100%</option>
                <option value={1.5}>150%</option>
                <option value={2}>200%</option>
                <option value={3}>300%</option>
                <option value={4}>400%</option>
              </select>
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {image && (
                <button className="btn" onClick={confirmCut} disabled={!currentRect} style={{ cursor: currentRect ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', fontSize: '0.85rem', background: currentRect ? '#f59e0b' : '#3f3f46', color: currentRect ? '#fff' : '#a1a1aa' }}>
                  ✂️ Cắt (Enter)
                </button>
              )}
              <button className="btn" onClick={handleDownloadImage} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', fontSize: '0.85rem', background: '#3b82f6' }}>
                <Download size={14} /> Lưu ảnh
              </button>
              <label className="btn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', fontSize: '0.85rem', background: '#10b981' }}>
                <Plus size={14} /> {image ? "Thêm ảnh" : "Tải ảnh"}
                <input type="file" accept="image/png" hidden onChange={handleImageUpload} />
              </label>
              {image && (
                <button className="btn" onClick={handleClearImage} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', fontSize: '0.85rem', background: '#ef4444' }}>
                  <Trash2 size={14} /> Xóa ảnh
                </button>
              )}
            </div>
          </div>
          
          <div style={{ 
            flexGrow: 1, 
            background: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgfALEUkP6PAAMj4wEGBmJ1oHwDI2N8AxgNGA2jAcOOR0A0J2z+HwA92zIFv85sJwAAAABJRU5ErkJggg==)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            overflow: 'auto',
            minHeight: '300px',
            maxHeight: '400px',
            position: 'relative'
          }}>
            {image ? (
              <div style={{ transform: `scale(${canvasZoom})`, transformOrigin: 'top left', display: 'inline-block' }}>
                <canvas ref={canvasRef} width={image.width} height={image.height}
                  onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                  style={{ cursor: 'crosshair', display: 'block' }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontSize: '0.9rem' }}>Chưa có ảnh.</div>
            )}
          </div>

          <div style={{ marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>Kho Sprites (Linh kiện)</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                {sprites.length === 0 ? <span style={{fontSize: '0.8rem', color: '#a1a1aa'}}>Hãy khoanh cắt ảnh để lấy linh kiện.</span> : null}
                {sprites.map((sprite, idx) => (
                    <div key={idx} style={{ background: '#27272a', border: '1px solid #3f3f46', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold' }}>#{idx}</span>
                        <span style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>{sprite.w}x{sprite.h}</span>
                        {!autoFrameMode && (
                            <button className="btn" style={{ background: '#3b82f6', padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => addPartToCurrentFrame(idx)}>
                                + Thêm
                            </button>
                        )}
                    </div>
                ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
             <button className="btn" style={{ background: '#f59e0b', padding: '4px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleUndo}>
               <Undo2 size={14}/> {autoFrameMode ? 'Hoàn tác' : 'Xóa Sprite cuối'}
             </button>
             <button className="btn" style={{ background: '#ef4444', padding: '4px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleClearAll}>
               <Trash2 size={14}/> Xóa hết
             </button>
          </div>
        </div>

        {/* CỘT 2: LIVE PREVIEW & TIMELINE */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem' }}>
              <Move size={16}/> Sân khấu Ghép
              <select value={previewZoom} onChange={(e) => setPreviewZoom(Number(e.target.value))} style={{ background: '#27272a', color: '#10b981', border: '1px solid #3f3f46', borderRadius: '4px', fontSize: '0.8rem', padding: '2px 4px', cursor: 'pointer', marginLeft: '8px' }}>
                <option value={1}>100%</option>
                <option value={1.5}>150%</option>
                <option value={2}>200%</option>
              </select>
            </h3>
            <button className="btn" style={{ background: isPlaying ? '#ef4444' : '#10b981', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }} onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <><Square size={14}/> Dừng</> : <><Play size={14}/> Chạy</>}
            </button>
          </div>
          
          <div style={{
            width: '500px', height: '500px', 
            background: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgfALEUkP6PAAMj4wEGBmJ1oHwDI2N8AxgNGA2jAcOOR0A0J2z+HwA92zIFv85sJwAAAABJRU5ErkJggg==)',
            border: '2px solid var(--glass-border)',
            borderRadius: '8px',
            position: 'relative',
            overflow: 'auto'
          }}>
            <div style={{ transform: `scale(${previewZoom})`, transformOrigin: 'top left', display: 'inline-block' }}>
              <canvas ref={previewCanvasRef} width={500} height={500} 
                onMouseDown={handlePreviewMouseDown} onMouseMove={handlePreviewMouseMove} onMouseUp={handlePreviewMouseUp} onMouseLeave={handlePreviewMouseUp}
                style={{ cursor: isPreviewDragging ? 'grabbing' : 'grab', display: 'block' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
             <button className="btn" style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#3f3f46', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => alignFrame('center')} title="Căn layer đang chọn ra giữa người">
               <AlignCenterHorizontal size={14} /> Căn Giữa
             </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
             <button className="btn" style={{ padding: '6px', background: 'var(--glass-bg)' }} onClick={goPrevFrame}>
               <ChevronLeft size={16} />
             </button>
             <span style={{ fontSize: '0.9rem', color: '#e4e4e7', minWidth: '80px', textAlign: 'center' }}>
               Khung: {totalAnims > 0 ? currentAnimIndex + 1 : 0} / {totalAnims}
             </span>
             <button className="btn" style={{ padding: '6px', background: 'var(--glass-bg)' }} onClick={goNextFrame}>
               <ChevronRight size={16} />
             </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button className="btn" style={{ background: '#10b981', padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={addEmptyFrame}>
                 <Plus size={14}/> Tạo Frame Mới
              </button>
              <button className="btn" style={{ background: '#3b82f6', padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={cloneCurrentFrame} title="Nhân bản khung hình hiện tại sang khung mới để làm animation">
                 <Copy size={14}/> Nhân bản Frame
              </button>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', width: '100%' }}>
            <label style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
               <input type="checkbox" checked={showOnionSkin} onChange={(e) => setShowOnionSkin(e.target.checked)} />
               <Layers size={14} /> Hiện bóng mờ (Onion Skin)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <label style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <input type="checkbox" checked={showPlayerDummy} onChange={(e) => setShowPlayerDummy(e.target.checked)} />
                 <User size={14} /> Hiện Nhân vật mẫu
              </label>
              
              {showPlayerDummy && (
                <>
                  <select value={dummyScale} onChange={(e) => setDummyScale(Number(e.target.value))} style={{ background: '#27272a', color: '#10b981', border: '1px solid #3f3f46', borderRadius: '4px', fontSize: '0.8rem', padding: '2px 4px', cursor: 'pointer' }}>
                    <option value={1}>Size X1</option>
                    <option value={2}>Size X2</option>
                    <option value={3}>Size X3</option>
                    <option value={4}>Size X4</option>
                  </select>

                  <label className="btn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', fontSize: '0.75rem', background: '#3b82f6', color: '#fff', borderRadius: '4px' }}>
                    <Plus size={12} /> Tải ảnh NV
                    <input type="file" accept="image/png, image/jpeg" hidden onChange={handleDummyUpload} />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CỘT 3: TỔNG HỢP LAYER & EXPORT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Quản lý Mảnh (Layers)</span>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'normal' }}>{currentFrameParts.length} mảnh</span>
            </h3>
            
            <div style={{ flexGrow: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '8px' }}>
                {currentFrameParts.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#a1a1aa', textAlign: 'center', marginTop: '20px' }}>
                        Khung hình trống.<br/>Tắt "Chế độ tự động" và bấm nút [+ Thêm] bên Kho Sprites.
                    </div>
                ) : (
                    currentFrameParts.map((part, idx) => (
                        <div key={idx} 
                             onClick={() => setSelectedLayerIndex(idx)}
                             style={{ 
                                 background: selectedLayerIndex === idx ? 'rgba(59, 130, 246, 0.2)' : '#27272a', 
                                 border: `1px solid ${selectedLayerIndex === idx ? '#3b82f6' : '#3f3f46'}`, 
                                 padding: '6px 8px', borderRadius: '4px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                 cursor: 'pointer'
                             }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '24px', height: '24px', background: '#18181b', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#10b981' }}>
                                    #{part.spriteId}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#e4e4e7' }}>Layer {idx}</span>
                                    <span style={{ fontSize: '0.65rem', color: '#a1a1aa' }}>X:{part.dx} | Y:{part.dy}</span>
                                </div>
                            </div>
                            <button className="btn" style={{ background: '#ef4444', padding: '2px 6px' }} onClick={(e) => { e.stopPropagation(); removePartFromCurrentFrame(idx); }}>
                                <Trash2 size={12}/>
                            </button>
                        </div>
                    ))
                )}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#a1a1aa', margin: '8px 0 0 0' }}>💡 Kéo chuột trên sân khấu sẽ di chuyển Layer đang chọn. Bỏ chọn để di chuyển cả cụm.</p>
          </div>

          <div className="glass-panel">
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>Xuất File Server</h3>
            
            <select value={baseZoom} onChange={(e) => setBaseZoom(Number(e.target.value))} style={{ width: '100%', marginBottom: '8px', background: 'rgba(0,0,0,0.5)', color: '#10b981', border: '1px solid var(--glass-border)', padding: '6px', borderRadius: '4px', fontSize: '0.85rem' }}>
               <option value={4}>Ảnh gốc X4 (Nét nhất)</option>
               <option value={3}>Ảnh gốc X3</option>
               <option value={2}>Ảnh gốc X2</option>
               <option value={1}>Ảnh gốc X1</option>
            </select>

            <select value={targetZoom} onChange={(e) => setTargetZoom(Number(e.target.value))} style={{ width: '100%', marginBottom: '16px', background: 'rgba(0,0,0,0.5)', color: '#3b82f6', border: '1px solid var(--glass-border)', padding: '6px', borderRadius: '4px', fontSize: '0.85rem' }}>
               <option value={4}>Xuất File Nhị Phân X4</option>
               <option value={3}>Xuất File Nhị Phân X3</option>
               <option value={2}>Xuất File Nhị Phân X2</option>
               <option value={1}>Xuất File Nhị Phân X1</option>
            </select>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn" onClick={handlePack} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', background: 'var(--primary)', padding: '8px' }}>
                <Download size={18} /> Data X{targetZoom}
              </button>
              <button className="btn" onClick={handleDownloadJSON} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', background: '#f59e0b', padding: '8px' }}>
                <Download size={18} /> JSON X{targetZoom}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
