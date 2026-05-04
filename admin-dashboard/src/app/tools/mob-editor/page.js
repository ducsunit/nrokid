"use client";
import React, { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';

export default function MobEditor() {
    const [imageSrc, setImageSrc] = useState(null);
    const [mobData, setMobData] = useState(null);
    const [imageObj, setImageObj] = useState(null);
    const [currentAnimIndex, setCurrentAnimIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [scale, setScale] = useState(1);
    const [previewScale, setPreviewScale] = useState(0); // 0 means Auto Fit
    
    const spriteSheetCanvasRef = useRef(null);
    const previewCanvasRef = useRef(null);

    // Xử lý upload ảnh Sprite Sheet
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImageSrc(url);
        }
    };

    // Xử lý upload file JSON
    const handleJsonUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target.result);
                    setMobData(json);
                    setCurrentAnimIndex(0); // Reset animation
                } catch (error) {
                    alert("File JSON không hợp lệ!");
                }
            };
            reader.readAsText(file);
        }
    };

    // Xuất file JSON
    const handleExportJSON = () => {
        if (!mobData) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mobData, null, 4));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", (mobData.id !== undefined ? mobData.id : "mob") + "_edited.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    // Cập nhật tọa độ dx, dy của một mảnh trong frame hiện tại
    const updatePartOffset = (partIndex, newDx, newDy) => {
        if (!mobData || isPlaying) return; // Chỉ cho sửa khi Pause
        const newData = { ...mobData };
        const frameIndex = newData.animations[currentAnimIndex];
        newData.frames[frameIndex][partIndex].dx = newDx;
        newData.frames[frameIndex][partIndex].dy = newDy;
        setMobData(newData);
    };

    // Vẽ ảnh Sprite Sheet lên Canvas trái khi có ảnh
    useEffect(() => {
        if (imageSrc) {
            const img = new window.Image();
            img.onload = () => setImageObj(img);
            img.src = imageSrc;
        }
    }, [imageSrc]);

    // Vẽ ảnh Sprite Sheet lên Canvas trái khi có ảnh
    useEffect(() => {
        if (imageObj && spriteSheetCanvasRef.current) {
            const canvas = spriteSheetCanvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = imageObj.width;
            canvas.height = imageObj.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(imageObj, 0, 0);
            
            // Nếu đã có data JSON, vẽ các khung bao quanh sprite (x, y, w, h) + offset + scale
            if (mobData && mobData.sprites) {
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 1;
                mobData.sprites.forEach(sprite => {
                    const sx = (sprite.x * scale) + offsetX;
                    const sy = (sprite.y * scale) + offsetY;
                    const sw = sprite.w * scale;
                    const sh = sprite.h * scale;
                    ctx.strokeRect(sx, sy, sw, sh);
                    // Vẽ ID nhỏ góc trên
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
                    ctx.fillRect(sx, sy, 16, 12);
                    ctx.fillStyle = '#000';
                    ctx.font = '10px Arial';
                    ctx.fillText(sprite.id, sx + 2, sy + 10);
                });
            }
        }
    }, [imageObj, mobData, offsetX, offsetY, scale]);

    // Animation loop cho Preview Canvas
    useEffect(() => {
        if (!mobData || !mobData.animations || !mobData.frames || !mobData.sprites || !imageObj) return;

        let animationFrameId;
        let lastTime = 0;
        const fps = 10; // Tốc độ khung hình mặc định
        const interval = 1000 / fps;

        const render = (time) => {
            if (isPlaying && time - lastTime > interval) {
                setCurrentAnimIndex((prev) => (prev + 1) % mobData.animations.length);
                lastTime = time;
            }

            const canvas = previewCanvasRef.current;
            if (canvas) {
                // Auto resize to fit container
                const container = canvas.parentElement;
                if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
                    canvas.width = container.clientWidth;
                    canvas.height = container.clientHeight;
                }
                
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Tâm của canvas
                const cx = canvas.width / 2;
                const cy = canvas.height / 2;

                const frameIndex = mobData.animations[currentAnimIndex];
                const frameParts = mobData.frames[frameIndex];

                if (frameParts) {
                    // Logic tính Auto Scale (Tự động co giãn để vừa khung)
                    let currentFinalScale = previewScale;
                    if (previewScale === 0) {
                        let maxExtent = 0;
                        frameParts.forEach(part => {
                            const sprite = mobData.sprites.find(s => s.id === part.sprite_id);
                            if (sprite) {
                                // Tính khoảng cách xa nhất từ tâm đến mép ngoài của mảnh
                                const extentX = Math.abs(part.dx * scale) + (sprite.w * scale);
                                const extentY = Math.abs(part.dy * scale) + (sprite.h * scale);
                                maxExtent = Math.max(maxExtent, extentX, extentY);
                            }
                        });
                        const padding = 20;
                        const availableSpace = Math.min(canvas.width, canvas.height) / 2 - padding;
                        currentFinalScale = maxExtent > 0 ? availableSpace / maxExtent : 1;
                        if (currentFinalScale > 1) currentFinalScale = 1; // Không zoom quá 100% khi auto
                    }

                    // Vẽ các mảnh của frame lên canvas theo thứ tự
                    frameParts.forEach(part => {
                        const sprite = mobData.sprites.find(s => s.id === part.sprite_id);
                        if (sprite) {
                            const sx = (sprite.x * scale) + offsetX;
                            const sy = (sprite.y * scale) + offsetY;
                            const sw = sprite.w * scale;
                            const sh = sprite.h * scale;
                            const pdx = part.dx * scale;
                            const pdy = part.dy * scale;
                            
                            ctx.drawImage(
                                imageObj,
                                sx, sy, sw, sh,
                                cx + (pdx * currentFinalScale), cy + (pdy * currentFinalScale), sw * currentFinalScale, sh * currentFinalScale
                            );
                        }
                    });
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationFrameId);
    }, [mobData, imageObj, currentAnimIndex, isPlaying, offsetX, offsetY, scale, previewScale]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Mob Animator & Editor</h1>
                <div className={styles.controls}>
                    <div>
                        <label>Sprite Sheet (PNG): </label>
                        <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                    </div>
                    <div>
                        <label>Data (JSON): </label>
                        <input type="file" accept=".json" onChange={handleJsonUpload} />
                    </div>
                </div>
            </header>

            <div className={styles.mainContent}>
                {/* Khu vực 1: Sprite Sheet */}
                <div className={styles.leftPanel}>
                    <h2>1. Nguồn Ảnh (Sprite Sheet)</h2>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '10px', background: '#333', padding: '10px', borderRadius: '4px', flexWrap: 'wrap'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <label style={{fontSize: '0.85rem', color: '#ccc'}}>Scale (x1-x4):</label>
                            <select value={scale} onChange={e => setScale(Number(e.target.value))} style={{background: '#222', color: '#fff', border: '1px solid #555', padding: '3px', borderRadius: '3px'}}>
                                <option value={1}>x1</option>
                                <option value={2}>x2</option>
                                <option value={3}>x3</option>
                                <option value={4}>x4</option>
                            </select>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <label style={{fontSize: '0.85rem', color: '#ccc'}}>Offset X:</label>
                            <input type="number" value={offsetX} onChange={e => setOffsetX(Number(e.target.value))} style={{width: '60px', background: '#222', color: '#fff', border: '1px solid #555', padding: '3px', borderRadius: '3px'}} />
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <label style={{fontSize: '0.85rem', color: '#ccc'}}>Offset Y:</label>
                            <input type="number" value={offsetY} onChange={e => setOffsetY(Number(e.target.value))} style={{width: '60px', background: '#222', color: '#fff', border: '1px solid #555', padding: '3px', borderRadius: '3px'}} />
                        </div>
                    </div>
                    <div className={styles.spriteContainer}>
                        {imageSrc ? (
                            <canvas ref={spriteSheetCanvasRef}></canvas>
                        ) : (
                            <p style={{color: '#777'}}>Vui lòng tải ảnh Sprite Sheet lên</p>
                        )}
                    </div>
                </div>

                {/* Khu vực 2: Canvas Vẽ Nhân Vật (Animation Preview) */}
                <div className={styles.centerPanel}>
                    <h2>2. Vẽ Nhân Vật (Preview)</h2>
                    <p style={{fontSize: '0.9rem', color: '#aaa', marginBottom: '1rem'}}>
                        Đây là nơi hiển thị nhân vật sau khi ghép các mảnh (frames) lại với nhau dựa trên tọa độ dx, dy.
                    </p>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '10px', justifyContent: 'space-between'}}>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button 
                                onClick={() => setIsPlaying(!isPlaying)}
                                style={{padding: '5px 15px', background: isPlaying ? '#d32f2f' : '#388e3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
                            >
                                {isPlaying ? '⏸ Pause để Sửa' : '▶ Play'}
                            </button>
                            <span style={{lineHeight: '28px', color: '#ccc', fontSize: '0.9rem'}}>
                                Khung hình: {mobData?.animations ? currentAnimIndex + 1 : 0} / {mobData?.animations?.length || 0}
                            </span>
                            <div style={{display: 'flex', gap: '5px', alignItems: 'center', marginLeft: '10px'}}>
                                <label style={{fontSize: '0.85rem', color: '#ccc'}}>Zoom Preview:</label>
                                <select value={previewScale} onChange={e => setPreviewScale(Number(e.target.value))} style={{background: '#222', color: '#fff', border: '1px solid #555', padding: '3px', borderRadius: '3px', cursor: 'pointer'}}>
                                    <option value={0}>Auto Fit (Tự khớp)</option>
                                    <option value={0.25}>25%</option>
                                    <option value={0.5}>50%</option>
                                    <option value={0.75}>75%</option>
                                    <option value={1}>100%</option>
                                    <option value={1.5}>150%</option>
                                    <option value={2}>200%</option>
                                </select>
                            </div>
                        </div>
                        {/* Nút điều hướng Frame khi Pause */}
                        {!isPlaying && mobData?.animations && (
                            <div style={{display: 'flex', gap: '5px'}}>
                                <button onClick={() => setCurrentAnimIndex(p => p > 0 ? p - 1 : mobData.animations.length - 1)} style={{padding: '5px 10px', background: '#555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>⬅ Prev</button>
                                <button onClick={() => setCurrentAnimIndex(p => (p + 1) % mobData.animations.length)} style={{padding: '5px 10px', background: '#555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Next ➡</button>
                            </div>
                        )}
                    </div>
                    <div className={styles.previewContainer}>
                        <canvas ref={previewCanvasRef} width={600} height={600} className={styles.previewCanvas}></canvas>
                    </div>

                    {/* Phần chỉnh sửa dx, dy */}
                    <div style={{marginTop: '1rem', width: '100%', background: '#2a2a2a', padding: '15px', borderRadius: '8px', border: '1px solid #444'}}>
                        <h3 style={{fontSize: '1rem', margin: '0 0 10px 0', color: '#a6e22e'}}>
                            {isPlaying ? "Dừng (Pause) để chỉnh sửa tọa độ dx, dy" : "Chỉnh sửa mảnh ghép (Frame hiện tại)"}
                        </h3>
                        {!isPlaying && mobData && mobData.frames && mobData.animations ? (
                            <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                                {mobData.frames[mobData.animations[currentAnimIndex]]?.map((part, idx) => (
                                    <div key={idx} style={{display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '8px', padding: '8px', background: '#1e1e1e', borderRadius: '6px', borderLeft: '4px solid #5c6bc0'}}>
                                        <span style={{width: '90px', color: '#ccc', fontSize: '0.9rem'}}>Sprite ID: <strong style={{color: '#fff'}}>{part.sprite_id}</strong></span>
                                        <label style={{fontSize: '0.85rem', color: '#aaa'}}>dx:</label>
                                        <input type="number" value={part.dx} onChange={e => updatePartOffset(idx, Number(e.target.value), part.dy)} style={{width: '60px', background: '#111', color: '#fff', border: '1px solid #555', padding: '4px', borderRadius: '3px'}} />
                                        <label style={{fontSize: '0.85rem', color: '#aaa'}}>dy:</label>
                                        <input type="number" value={part.dy} onChange={e => updatePartOffset(idx, part.dx, Number(e.target.value))} style={{width: '60px', background: '#111', color: '#fff', border: '1px solid #555', padding: '4px', borderRadius: '3px'}} />
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Khu vực 3: Quản lý Dữ liệu JSON */}
                <div className={styles.rightPanel}>
                    <h2>3. Dữ liệu (JSON)</h2>
                    {mobData ? (
                        <>
                            <div className={styles.dataStats}>
                                <div className={styles.statCard}>
                                    <span>Sprites</span>
                                    <strong>{mobData.sprites?.length || 0}</strong>
                                </div>
                                <div className={styles.statCard}>
                                    <span>Frames</span>
                                    <strong>{mobData.frames?.length || 0}</strong>
                                </div>
                                <div className={styles.statCard}>
                                    <span>Animations</span>
                                    <strong>{mobData.animations?.length || 0}</strong>
                                </div>
                                <div className={styles.statCard}>
                                    <span>ID</span>
                                    <strong>{mobData.id !== undefined ? mobData.id : 'N/A'}</strong>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleExportJSON}
                                style={{width: '100%', padding: '10px', background: '#ff9800', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginBottom: '15px'}}
                            >
                                💾 TẢI XUỐNG FILE JSON
                            </button>

                            <pre className={styles.jsonPreview}>
                                {JSON.stringify(mobData, null, 2)}
                            </pre>
                        </>
                    ) : (
                        <div style={{color: '#777', textAlign: 'center', marginTop: '2rem'}}>
                            <p>Chưa có dữ liệu JSON.</p>
                            <p>Hãy tải file .json lên để bắt đầu.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
