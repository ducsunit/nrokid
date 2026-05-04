'use client';

import { Database, Ghost, Map as MapIcon, Package, ArrowRight, Wand2 } from 'lucide-react';
import './globals.css';

export default function Dashboard() {
  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }} className="animate-in delay-1">
        <h1 className="title">NRO Kid Modding Suite</h1>
        <p className="subtitle">Professional tools for game asset management and world building</p>
      </header>

      <div className="dashboard-grid">
        {/* Modding Toolkit Section - THE MAIN FOCUS */}
        <div className="animate-in delay-2" style={{ gridColumn: '1 / -1', marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '32px', fontSize: '1.8rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={28} color="var(--primary)" />
            NRO Modding Toolkit
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <a href="/tools/mob-editor" className="glass-panel" style={{ textDecoration: 'none', transition: 'all 0.3s ease', display: 'block', border: '1px solid rgba(92, 107, 192, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ background: 'rgba(92, 107, 192, 0.2)', padding: '12px', borderRadius: '12px' }}>
                  <Ghost size={28} color="#5c6bc0" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Mob & Effect Animator</h3>
                  <span style={{ fontSize: '0.7rem', color: '#5c6bc0', textTransform: 'uppercase', fontWeight: 'bold' }}>Animation Editor</span>
                </div>
              </div>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.6' }}>
                Công cụ chỉnh sửa chuyển động, tọa độ <strong>dx/dy</strong> cho quái vật và hiệu ứng. Hỗ trợ đầy đủ Scale X1-X4.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5c6bc0', fontWeight: '600', fontSize: '0.9rem' }}>
                Mở ứng dụng <ArrowRight size={16} />
              </div>
            </a>

            <a href="/tools/map-editor" className="glass-panel" style={{ textDecoration: 'none', transition: 'all 0.3s ease', display: 'block', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '12px' }}>
                  <MapIcon size={28} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Map Visual Editor</h3>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 'bold' }}>World Builder</span>
                </div>
              </div>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.6' }}>
                Thiết kế bản đồ trực quan bằng <strong>Tileset</strong>. Hỗ trợ xuất file Binary (.bin) chuẩn cho Server Java.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '600', fontSize: '0.9rem' }}>
                Mở ứng dụng <ArrowRight size={16} />
              </div>
            </a>

            <a href="/tools/effect-packer" className="glass-panel" style={{ textDecoration: 'none', transition: 'all 0.3s ease', display: 'block', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '12px' }}>
                  <Package size={28} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Visual Effect Packer</h3>
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 'bold' }}>Resource Packer</span>
                </div>
              </div>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.6' }}>
                Tạo Effect/Boss mới từ ảnh thô. Khoanh vùng cắt mảnh và đóng gói thành <strong>Sprite Sheet & JSON</strong>.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: '600', fontSize: '0.9rem' }}>
                Mở ứng dụng <ArrowRight size={16} />
              </div>
            </a>

            <a href="/tools/bg-remover" className="glass-panel" style={{ textDecoration: 'none', transition: 'all 0.3s ease', display: 'block', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '12px', borderRadius: '12px' }}>
                  <Wand2 size={28} color="#ec4899" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Smart BG Remover</h3>
                  <span style={{ fontSize: '0.7rem', color: '#ec4899', textTransform: 'uppercase', fontWeight: 'bold' }}>Transparency Editor</span>
                </div>
              </div>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.6' }}>
                Xóa nền thông minh, <strong>giữ nguyên hào quang</strong> và hiệu ứng mờ ảo. Tối ưu cho Logo và Aura.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899', fontWeight: '600', fontSize: '0.9rem' }}>
                Mở ứng dụng <ArrowRight size={16} />
              </div>
            </a>
          </div>
        </div>
      </div>
      
      <footer style={{ marginTop: '60px', textAlign: 'center', color: '#444', fontSize: '0.8rem', borderTop: '1px solid #222', paddingTop: '20px' }}>
        NRO Kid Modding Toolkit © 2024 - Professional Game Development Assets
      </footer>
    </div>
  );
}
