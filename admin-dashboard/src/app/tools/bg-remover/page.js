'use client';

import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Download, Trash2, Wand2, Maximize2, Move, AlertCircle, ChevronLeft, Settings2 } from 'lucide-react';
import Link from 'next/link';

export default function BackgroundRemover() {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [mode, setMode] = useState('smart'); // 'smart' or 'nro'
  const [bgColor, setBgColor] = useState({ r: 0, g: 0, b: 0 });
  const [threshold, setThreshold] = useState(20);
  const [smoothness, setSmoothness] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef(null);
  const originalCanvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setOriginalImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScaleImage = (factor) => {
    if (!originalImage) return;
    if (!confirm(`Hành động này sẽ thu nhỏ ảnh gốc xuống ${factor*100}%. Bạn có muốn tiếp tục?`)) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(originalImage.width * factor));
    canvas.height = Math.max(1, Math.round(originalImage.height * factor));
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    
    const resizedImg = new Image();
    resizedImg.onload = () => {
      setImage(resizedImg);
    };
    resizedImg.src = canvas.toDataURL('image/png');
  };


  const processImage = (img, bg, thresh, smooth, currentMode) => {
    if (!img || !canvasRef.current) return;
    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const targetR = bg.r;
    const targetG = bg.g;
    const targetB = bg.b;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      if (currentMode === 'nro' && targetR === 0 && targetG === 0 && targetB === 0) {
        // NRO EFFECT MODE: Perfect for black backgrounds
        // Step 1: Calculate raw alpha based on brightness
        let rawAlpha = Math.max(r, g, b) / 255;
        
        if (rawAlpha > 0) {
            // Step 2: Unmultiply color to recover original vibrancy (before it was mixed with black)
            // This is the key to preventing "blur/smudge"
            const boost = 1 / rawAlpha;
            data[i] = Math.min(255, r * boost);
            data[i+1] = Math.min(255, g * boost);
            data[i+2] = Math.min(255, b * boost);
        }
        
        // Step 3: Apply threshold and smoothness to create clean edges
        let alphaValue = rawAlpha * 255;
        if (alphaValue < thresh) {
            alphaValue = 0;
        } else if (alphaValue < thresh + smooth) {
            alphaValue = ((alphaValue - thresh) / smooth) * 255;
        }
        
        data[i + 3] = alphaValue;
        continue;
      }

      // ADVANCED MODE (For non-black backgrounds)
      let aR = 0, aG = 0, aB = 0;
      if (targetR > 0) aR = r > targetR ? (r - targetR) / (255 - targetR) : (targetR - r) / targetR;
      else aR = r / 255;
      
      if (targetG > 0) aG = g > targetG ? (g - targetG) / (255 - targetG) : (targetG - g) / targetG;
      else aG = g / 255;
      
      if (targetB > 0) aB = b > targetB ? (b - targetB) / (255 - targetB) : (targetB - b) / targetB;
      else aB = b / 255;
      
      let alpha = Math.max(aR, aG, aB);
      const normThresh = thresh / 255;
      const normSmooth = smooth / 255;
      
      if (alpha < normThresh) alpha = 0;
      else if (alpha < normThresh + normSmooth) alpha = (alpha - normThresh) / normSmooth;
      else alpha = 1;

      if (alpha > 0 && alpha < 1.0) {
          const safeAlpha = Math.max(alpha, 0.05);
          data[i] = Math.max(0, Math.min(255, (r - (1 - alpha) * targetR) / safeAlpha));
          data[i+1] = Math.max(0, Math.min(255, (g - (1 - alpha) * targetG) / safeAlpha));
          data[i+2] = Math.max(0, Math.min(255, (b - (1 - alpha) * targetB) / safeAlpha));
      }
      
      data[i + 3] = alpha * 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
    setProcessedImage(canvas.toDataURL());
    setIsProcessing(false);
  };

  useEffect(() => {
    if (image) {
      const timer = setTimeout(() => {
        processImage(image, bgColor, threshold, smoothness, mode);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [image, bgColor, threshold, smoothness, mode]);

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.download = 'nrokid_transparent_effect.png';
    link.href = processedImage;
    link.click();
  };

  const pickColor = (e) => {
    if (!image) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0); // Temporary redraw original to pick color
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setBgColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    // Re-process will be triggered by useEffect
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link href="/" className="btn" style={{ padding: '8px', background: 'var(--glass-bg)' }}>
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="title" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <Wand2 size={28} color="var(--primary)" />
            Smart Background Remover
          </h1>
          <p className="subtitle" style={{ margin: '4px 0 0 0' }}>Xóa nền nhưng giữ nguyên hiệu ứng hào quang (Glow & Aura)</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
        {/* VIEWPORT */}
        <div className="glass-panel" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>
              {image ? `Kích thước: ${image.width}x${image.height}` : 'Chưa tải ảnh'}
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label className="btn" style={{ background: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={18} /> Tải ảnh lên
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </label>
              {processedImage && (
                <button className="btn" onClick={handleDownload} style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={18} /> Tải về PNG
                </button>
              )}
            </div>
          </div>

          {image && (
             <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flexGrow: 1 }}>
                   <p style={{ margin: 0, fontSize: '0.85rem', color: '#e4e4e7', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <Settings2 size={16} color="#3b82f6" /> Thu nhỏ ảnh gốc
                   </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button className="btn" onClick={() => handleScaleImage(0.75)} style={{ background: '#3b82f6', padding: '4px 12px', fontSize: '0.8rem' }}>75%</button>
                   <button className="btn" onClick={() => handleScaleImage(0.5)} style={{ background: '#f59e0b', padding: '4px 12px', fontSize: '0.8rem' }}>50%</button>
                   <button className="btn" onClick={() => handleScaleImage(0.25)} style={{ background: '#ef4444', padding: '4px 12px', fontSize: '0.8rem' }}>25%</button>
                </div>
             </div>
          )}

          <div style={{ 
            flexGrow: 1, 
            background: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgfALEUkP6PAAMj4wEGBmJ1oHwDI2N8AxgNGA2jAcOOR0A0J2z+HwA92zIFv85sJwAAAABJRU5ErkJggg==)',
            borderRadius: '8px',
            border: '2px dashed var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            position: 'relative'
          }}>
            {image ? (
              <canvas 
                ref={canvasRef} 
                onClick={pickColor}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '700px', 
                  cursor: 'crosshair',
                  boxShadow: '0 0 20px rgba(0,0,0,0.5)' 
                }} 
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#555' }}>
                <ImageIcon size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
                <p>Kéo thả hoặc chọn ảnh để bắt đầu</p>
              </div>
            )}
            {isProcessing && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#71717a', margin: 0 }}>
            💡 Mẹo: Nhấp chuột trực tiếp vào vùng màu nền trên ảnh để chọn màu cần xóa.
          </p>
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#fff' }}>Cấu hình xóa nền</h3>
            
            <div style={{ marginBottom: '25px', display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
              <button 
                onClick={() => setMode('smart')}
                style={{ 
                  flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: mode === 'smart' ? 'var(--primary)' : 'transparent',
                  color: mode === 'smart' ? '#fff' : '#a1a1aa',
                  fontSize: '0.8rem', fontWeight: 'bold', transition: 'all 0.2s'
                }}>
                Smart Mode
              </button>
              <button 
                onClick={() => setMode('nro')}
                style={{ 
                  flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: mode === 'nro' ? 'var(--primary)' : 'transparent',
                  color: mode === 'nro' ? '#fff' : '#a1a1aa',
                  fontSize: '0.8rem', fontWeight: 'bold', transition: 'all 0.2s'
                }}>
                NRO Effect
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '8px' }}>Màu nền cần xóa:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: '8px', 
                  background: `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`,
                  border: '2px solid #3f3f46'
                }}></div>
                <div style={{ fontSize: '0.8rem', color: '#e4e4e7' }}>
                  RGB({bgColor.r}, {bgColor.g}, {bgColor.b})
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Độ nhạy (Threshold):</label>
                <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>{threshold}</span>
              </div>
              <input 
                type="range" min="0" max="255" value={threshold} 
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Độ mượt (Smoothness):</label>
                <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>{smoothness}</span>
              </div>
              <input 
                type="range" min="0" max="255" value={smoothness} 
                onChange={(e) => setSmoothness(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={16} color="#3b82f6" style={{ marginTop: '2px' }} />
                <p style={{ fontSize: '0.75rem', color: '#93c5fd', margin: 0, lineHeight: '1.4' }}>
                  Thuật toán <strong>Smart Alpha</strong> sẽ tự động nhận diện vùng hào quang để giữ lại độ mờ ảo, thay vì cắt cứng. Phù hợp nhất với ảnh nền Đen.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#10b981' }}>Tại sao chọn công cụ này?</h4>
            <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.8rem', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Giữ nguyên tia sét, hào quang mờ.</li>
              <li>Không bị răng cưa mép ảnh.</li>
              <li>Xử lý trực tiếp trên trình duyệt (Bảo mật).</li>
              <li>Tối ưu cho tài nguyên game NRO.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
