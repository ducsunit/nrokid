import struct
import os
import json
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext

def decode_effect(file_path, version=221):
    if not os.path.exists(file_path):
        return f"File not found: {file_path}"
        
    with open(file_path, 'rb') as f:
        data = f.read()
    
    file_size = len(data)
    offset = 0
    
    def read_byte():
        nonlocal offset
        if offset >= file_size: return 0
        val = data[offset]
        offset += 1
        return val

    def read_short():
        nonlocal offset
        if offset + 2 > file_size: 
            return read_byte()
        val = struct.unpack('>h', data[offset:offset+2])[0]
        offset += 2
        return val

    # 1. Sprites
    num_sprites = read_byte()
    sprites = []
    for _ in range(num_sprites):
        if offset >= file_size: break
        s_id = read_byte()
        if version < 220 or file_size < 500:
            x = read_byte()
            y = read_byte()
        else:
            x = read_short()
            y = read_short()
        w = read_byte()
        h = read_byte()
        sprites.append({"id": s_id, "x": x, "y": y, "w": w, "h": h})
    
    # 2. Frames
    if offset + 2 <= file_size:
        num_frames = read_short()
        frames = []
        for _ in range(num_frames):
            if offset >= file_size: break
            num_elements = read_byte()
            elements = []
            for _ in range(num_elements):
                if offset >= file_size: break
                dx = read_short()
                dy = read_short()
                sid = read_byte()
                elements.append({"dx": dx, "dy": dy, "spriteId": sid})
            frames.append(elements)
    else:
        frames = []
        
    # 3. Animations
    if offset + 2 <= file_size:
        num_anims = read_short()
        animations = []
        for _ in range(num_anims):
            if offset >= file_size: break
            animations.append(read_short())
    else:
        animations = []
        
    return {
        "sprites": sprites,
        "frames": frames,
        "animations": animations,
        "file_size": file_size
    }

class DecoderUI:
    def __init__(self, root):
        self.root = root
        self.root.title("NRO DataEffect Decoder (Pro)")
        self.root.geometry("600x700")
        self.root.configure(bg="#1e1e1e")

        # Header
        lbl_title = tk.Label(root, text="NRO EFFECT DECODER", font=("Arial", 16, "bold"), fg="#6366f1", bg="#1e1e1e")
        lbl_title.pack(pady=20)

        # Buttons
        btn_frame = tk.Frame(root, bg="#1e1e1e")
        btn_frame.pack(pady=10)

        self.btn_open = tk.Button(btn_frame, text="Open DataEffect File", command=self.open_file, bg="#3b82f6", fg="white", padx=20, pady=5)
        self.btn_open.grid(row=0, column=0, padx=5)

        self.btn_save = tk.Button(btn_frame, text="Save as JSON", command=self.save_json, bg="#10b981", fg="white", padx=20, pady=5)
        self.btn_save.grid(row=0, column=1, padx=5)

        # Status
        self.lbl_status = tk.Label(root, text="Chưa có file nào được chọn", fg="#a1a1aa", bg="#1e1e1e")
        self.lbl_status.pack()

        # Result Area
        self.text_area = scrolledtext.ScrolledText(root, width=70, height=30, bg="#09090b", fg="#e4e4e7", font=("Consolas", 10))
        self.text_area.pack(pady=20, padx=20)

        self.current_result = None

    def open_file(self):
        path = filedialog.askopenfilename(title="Chọn file DataEffect")
        if not path: return

        result = decode_effect(path)
        if isinstance(result, str):
            messagebox.showerror("Lỗi", result)
            return

        self.current_result = result
        self.lbl_status.config(text=f"Đã đọc: {os.path.basename(path)} ({result['file_size']} bytes)", fg="#10b981")
        
        # Display summary
        self.text_area.delete(1.0, tk.END)
        self.text_area.insert(tk.END, json.dumps(result, indent=2))

    def save_json(self):
        if not self.current_result:
            messagebox.showwarning("Cảnh báo", "Hãy mở file trước!")
            return
        
        path = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON files", "*.json")])
        if not path: return
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(self.current_result, f, indent=2)
        messagebox.showinfo("Thành công", f"Đã lưu tại {path}")

if __name__ == "__main__":
    root = tk.Tk()
    app = DecoderUI(root)
    root.mainloop()
