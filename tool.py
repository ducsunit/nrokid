import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk

def remove_black_to_alpha(img, threshold=20):
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]

            # nếu gần màu đen thì làm trong suốt
            if r < threshold and g < threshold and b < threshold:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                pixels[x, y] = (r, g, b, 255)

    return img


class App:

    def __init__(self, root):
        self.root = root
        self.root.title("Sprite Background Remover")

        self.img = None
        self.preview = None

        btn_open = tk.Button(root, text="Open Image", command=self.open_image)
        btn_open.pack(pady=10)

        btn_process = tk.Button(root, text="Remove Black Background", command=self.process)
        btn_process.pack(pady=10)

        btn_save = tk.Button(root, text="Save PNG", command=self.save)
        btn_save.pack(pady=10)

        self.label = tk.Label(root)
        self.label.pack()

    def open_image(self):
        path = filedialog.askopenfilename()
        if not path:
            return

        self.img = Image.open(path)

        preview = self.img.resize((400, int(400 * self.img.height / self.img.width)))
        self.preview = ImageTk.PhotoImage(preview)

        self.label.config(image=self.preview)

    def process(self):
        if self.img is None:
            return

        self.img = remove_black_to_alpha(self.img)

        preview = self.img.resize((400, int(400 * self.img.height / self.img.width)))
        self.preview = ImageTk.PhotoImage(preview)

        self.label.config(image=self.preview)

    def save(self):
        if self.img is None:
            return

        path = filedialog.asksaveasfilename(defaultextension=".png")
        if not path:
            return

        self.img.save(path)


root = tk.Tk()
app = App(root)
root.mainloop()