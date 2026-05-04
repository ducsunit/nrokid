"use client";
import React, { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';

export default function MapEditor() {
    const [tilesetSrc, setTilesetSrc] = useState(null);
    const [tilesetImg, setTilesetImg] = useState(null);
    const [tileSize, setTileSize] = useState(24); // Size của 1 ô gạch (NRO thường dùng 24)
    const [mapWidth, setMapWidth] = useState(30); // Số lượng ô theo chiều ngang
    const [mapHeight, setMapHeight] = useState(20); // Số lượng ô theo chiều dọc
    const [mapData, setMapData] = useState([]); // Array 2 chiều lưu ID tile
    const [selectedTileId, setSelectedTileId] = useState(0); // ID của tile đang chọn để vẽ
    const [isDrawing, setIsDrawing] = useState(false); // Trạng thái đang giữ chuột để vẽ

    const mapCanvasRef = useRef(null);
    const tilesetCanvasRef = useRef(null);

    // Khởi tạo map data rỗng (-1 nghĩa là ô trống)
    useEffect(() => {
        const initialMap = Array(mapHeight).fill().map(() => Array(mapWidth).fill(-1));
        setMapData(initialMap);
    }, [mapWidth, mapHeight]);

    // Xử lý upload Tileset (PNG)
    const handleTilesetUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setTilesetSrc(url);
            const img = new window.Image();
            img.onload = () => {
                setTilesetImg(img);
                // Vẽ tileset lên canvas
                if (tilesetCanvasRef.current) {
                    const canvas = tilesetCanvasRef.current;
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    // Vẽ lưới cho tileset
                    drawGrid(ctx, img.width, img.height, tileSize);
                }
            };
            img.src = url;
        }
    };

    // Hàm vẽ lưới (Grid)
    const drawGrid = (ctx, width, height, size) => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= width; x += size) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y <= height; y += size) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }
    };

    // Render bản đồ lên Canvas mỗi khi mapData thay đổi
    useEffect(() => {
        if (mapCanvasRef.current && tilesetImg) {
            const canvas = mapCanvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = mapWidth * tileSize;
            canvas.height = mapHeight * tileSize;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Số cột trong tileset
            const tilesPerRow = Math.floor(tilesetImg.width / tileSize);

            for (let y = 0; y < mapHeight; y++) {
                for (let x = 0; x < mapWidth; x++) {
                    const tileId = mapData[y][x];
                    if (tileId !== -1) {
                        const tileX = (tileId % tilesPerRow) * tileSize;
                        const tileY = Math.floor(tileId / tilesPerRow) * tileSize;
                        ctx.drawImage(
                            tilesetImg,
                            tileX, tileY, tileSize, tileSize,
                            x * tileSize, y * tileSize, tileSize, tileSize
                        );
                    }
                }
            }
            drawGrid(ctx, canvas.width, canvas.height, tileSize);
        }
    }, [mapData, tilesetImg, mapWidth, mapHeight, tileSize]);

    // Xử lý Click chọn Tile trên khung Tileset
    const handleTilesetClick = (e) => {
        if (!tilesetImg) return;
        const rect = tilesetCanvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / tileSize);
        const row = Math.floor(y / tileSize);
        const tilesPerRow = Math.floor(tilesetImg.width / tileSize);
        
        const id = row * tilesPerRow + col;
        setSelectedTileId(id);
    };

    // Hàm tô tile vào map
    const paintTile = (e) => {
        if (!tilesetImg || !isDrawing) return;
        const rect = mapCanvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / tileSize);
        const row = Math.floor(y / tileSize);

        if (row >= 0 && row < mapHeight && col >= 0 && col < mapWidth) {
            // Chuột phải (button === 2) để xóa, chuột trái để vẽ
            const newTileId = e.buttons === 2 ? -1 : selectedTileId;
            if (mapData[row][col] !== newTileId) {
                const newMapData = [...mapData];
                newMapData[row] = [...newMapData[row]];
                newMapData[row][col] = newTileId;
                setMapData(newMapData);
            }
        }
    };

    const handleExportMapJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapData));
        const dl = document.createElement('a');
        dl.setAttribute("href", dataStr);
        dl.setAttribute("download", "map_data.json");
        document.body.appendChild(dl);
        dl.click();
        dl.remove();
    };

    // Xuất file Binary (.bin) cho Server Java
    const handleExportBinary = () => {
        // Định dạng cơ bản: 1 byte width, 1 byte height, sau đó là mảng các byte Tile ID
        const buffer = new ArrayBuffer(2 + mapWidth * mapHeight);
        const view = new DataView(buffer);
        view.setUint8(0, mapWidth);
        view.setUint8(1, mapHeight);
        
        let offset = 2;
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                // Nếu là ô trống (-1), gán mặc định là 0
                let tileId = mapData[y][x];
                if (tileId < 0 || tileId > 255) tileId = 0; // Giới hạn 1 byte
                view.setUint8(offset++, tileId);
            }
        }

        const blob = new Blob([buffer], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const dl = document.createElement('a');
        dl.setAttribute("href", url);
        dl.setAttribute("download", "map_data.bin");
        document.body.appendChild(dl);
        dl.click();
        dl.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Vẽ Map (Map Editor)</h1>
                <div style={{color: '#aaa', fontSize: '0.9rem'}}>
                    Trái chuột: Vẽ | Phải chuột: Xóa
                </div>
            </header>

            <div className={styles.mainContent}>
                {/* Panel Trái: Cấu hình và Tileset */}
                <div className={styles.leftPanel}>
                    <h2 className={styles.sectionTitle}>1. Bộ gạch (Tileset)</h2>
                    <div className={styles.inputGroup}>
                        <label>Tải ảnh Tileset lên (PNG):</label>
                        <input type="file" accept="image/png" onChange={handleTilesetUpload} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Kích thước 1 ô (Tile Size - px):</label>
                        <input type="number" value={tileSize} onChange={e => setTileSize(Number(e.target.value))} />
                    </div>

                    <div style={{marginTop: '10px'}}>
                        <label style={{fontSize: '0.85rem', color: '#ccc'}}>Tile đang chọn: <strong>{selectedTileId}</strong></label>
                    </div>

                    <div className={styles.tilesetContainer} style={{position: 'relative'}}>
                        {tilesetSrc && (
                            <>
                                <canvas ref={tilesetCanvasRef} onClick={handleTilesetClick}></canvas>
                                {/* Khung viền chỉ báo ô đang được chọn trên tileset */}
                                {tilesetImg && (
                                    <div className={styles.tileSelector} style={{
                                        width: tileSize, height: tileSize,
                                        left: (selectedTileId % Math.floor(tilesetImg.width / tileSize)) * tileSize,
                                        top: Math.floor(selectedTileId / Math.floor(tilesetImg.width / tileSize)) * tileSize
                                    }}></div>
                                )}
                            </>
                        )}
                        {!tilesetSrc && <p style={{color: '#666', padding: '10px', fontSize: '0.9rem'}}>Chưa có ảnh Tileset</p>}
                    </div>
                </div>

                {/* Panel Giữa: Bản đồ */}
                <div className={styles.centerPanel}>
                    <h2 className={styles.sectionTitle}>2. Vẽ Bản Đồ</h2>
                    <div 
                        className={styles.mapCanvasContainer}
                        onMouseDown={(e) => { setIsDrawing(true); paintTile(e); }}
                        onMouseUp={() => setIsDrawing(false)}
                        onMouseLeave={() => setIsDrawing(false)}
                        onMouseMove={paintTile}
                        onContextMenu={(e) => e.preventDefault()} // Chặn menu chuột phải để dùng chuột phải xóa
                    >
                        <canvas ref={mapCanvasRef} className={styles.mapCanvas} 
                            width={mapWidth * tileSize} 
                            height={mapHeight * tileSize}>
                        </canvas>
                    </div>
                </div>

                {/* Panel Phải: Cấu hình Map & Export */}
                <div className={styles.rightPanel}>
                    <h2 className={styles.sectionTitle}>3. Cấu hình & Dữ liệu</h2>
                    <div className={styles.inputGroup}>
                        <label>Chiều ngang Map (Số ô):</label>
                        <input type="number" value={mapWidth} onChange={e => setMapWidth(Number(e.target.value))} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Chiều dọc Map (Số ô):</label>
                        <input type="number" value={mapHeight} onChange={e => setMapHeight(Number(e.target.value))} />
                    </div>
                    
                    <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => {
                        if(confirm('Bạn có chắc muốn xóa trắng toàn bộ map?')) {
                            setMapData(Array(mapHeight).fill().map(() => Array(mapWidth).fill(-1)));
                        }
                    }} style={{marginTop: '20px'}}>
                        🗑 XÓA TRẮNG MAP
                    </button>

                    <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleExportMapJSON}>
                        📄 XUẤT FILE MAP (JSON)
                    </button>

                    <button className={`${styles.btn}`} onClick={handleExportBinary} style={{background: '#ff9800'}}>
                        💾 XUẤT FILE BINARY (.bin)
                    </button>

                    <h3 style={{fontSize: '0.9rem', marginTop: '20px', color: '#aaa'}}>Preview JSON:</h3>
                    <pre className={styles.jsonPreview}>
                        {JSON.stringify({
                            width: mapWidth,
                            height: mapHeight,
                            tileSize: tileSize,
                            data: mapData
                        }, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
