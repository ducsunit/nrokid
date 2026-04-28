# 🎨 Hướng dẫn Công cụ Visual Effect Packer & Thêm Hào quang vào Game

Tài liệu này hướng dẫn chi tiết cách sử dụng bộ công cụ **Visual Sprite Cutter & Packer** (được tích hợp trong Admin Dashboard) để tạo ra các Hào quang (Aura), Danh hiệu, hoặc Hiệu ứng Kỹ năng mới, và cách đưa chúng vào Server NRO Kid.

---

## 🌟 1. Tổng quan Công cụ
Công cụ này giải quyết bài toán lớn nhất của các Admin NRO: **Tạo file `DataEffect` nhị phân mà không cần biết lập trình Java hay hiểu sâu về Byte/Short.**

**Tính năng chính:**
- ✂️ **Cắt Sprite bằng chuột:** Kéo thả trực quan như Photoshop.
- 🎬 **Live Preview:** Xem trước ảnh động với tốc độ thực tế của game (150ms/frame).
- 🧅 **Onion Skin (Bóng mờ):** Hiển thị khung hình trước đó dưới dạng bóng mờ để căn chỉnh Pixel-Perfect.
- 🧲 **Auto-Align:** Căn giữa ngực hoặc căn dưới chân tự động chỉ với 1 nút bấm.
- 📐 **Smart Scaling (x1 - x4):** Chỉ cần cắt trên 1 ảnh, tool tự nhân tỷ lệ tọa độ cho cả 4 phiên bản cấu hình máy.

---

## 🕹️ 2. Quy trình Cắt Hào quang
1. Mở trình duyệt truy cập: `http://localhost:3000/tools/effect-packer`.
2. **Khu vực 1:** Chọn **Kích thước ảnh gốc** (thường là X4 vì ảnh to dễ cắt), sau đó tải tấm ảnh PNG chứa các khung hình hào quang lên.
3. Dùng chuột trái **kéo thành các hình chữ nhật** bao quanh từng hào quang (Sprite). Cắt theo thứ tự chuyển động từ trái sang phải, từ trên xuống dưới.
4. Lỡ tay cắt sai? Ấn nút **"Hoàn tác bước cắt cuối"** màu cam ở ngay dưới tấm ảnh.
5. **Khu vực 2 (Preview):**
   - Bật tick **"Hiện hình nộm Nhân vật"** để lấy gốc tọa độ.
   - Bấm nút **"Dừng"** để xem từng bước ảnh (Frame). Dùng nút `[<]` và `[>]` để chuyển qua lại giữa các bước.
   - Dùng chuột **kéo thả cái hào quang** đè lên người hình nộm. Hoặc bấm nút **[Căn Giữa Người]** / **[Căn Dưới Chân]** để máy tự làm.
   - Bấm **"Chạy thử"** để xem Hào quang bùng cháy mượt mà chưa.

---

## 📥 3. Xuất Data (Export)
Khác với ảnh tĩnh, Hào quang trong NRO yêu cầu 4 bộ Data tương ứng với 4 chất lượng màn hình của Client (x1, x2, x3, x4). Tool đã tự động hóa việc này:

Ở **Khu vực 3**:
1. Chọn **Tải Data X4 (100%)** -> Nhấn nút Tải về -> Được file `DataEffect_Custom_X4`.
2. Lần lượt chọn X3, X2, X1 và nhấn Tải về. (Tool sẽ tự dùng toán học để chia tỉ lệ tọa độ không bị vỡ).

---

## 🚀 4. Đưa Hào quang vào Game NRO
Sau khi có File Data và File Ảnh PNG, bạn tiến hành đưa vào source code Server.

### Bước 1: Đặt file vào Server Data
Truy cập vào source code NRO Kid: `nrokid/data/effect/`. Trong này có 4 thư mục `x1, x2, x3, x4`. 
Dưới đây là ví dụ cho thư mục `x4`:
1. **Copy Ảnh:** Đưa tấm ảnh PNG gốc vào `data/effect/x4/img/`. Đổi tên thành **`ImgEffect_<ID>.png`**.
2. **Copy Data:** Đưa file nhị phân `DataEffect_Custom_X4` vào `data/effect/x4/data/`. Đổi tên thành **`DataEffect_<ID>`**.
   - *(Ví dụ bạn chọn ID là `200`: Tên file sẽ là `ImgEffect_200.png` và `DataEffect_200`)*.
   - Lặp lại quy trình này cho các thư mục `x1, x2, x3` (Nhớ dùng Photoshop thu nhỏ ảnh PNG tương ứng với tỷ lệ 75%, 50%, 25% trước khi bỏ vào img).

### Bước 2: Gọi Hào quang xuất hiện trong Java
Server giao tiếp với Client để vẽ Hào quang bằng **Packet Cmd -128 (`CHAR_EFFECT`)**. 

Ví dụ, muốn Hào quang số `200` xuất hiện vĩnh viễn trên đầu nhân vật, bạn có thể gọi hàm gửi Packet trong `Controller.java` hoặc `Service.java`:
```java
public void sendAuraEffect(Player player, int effectId) {
    Message msg = new Message(-128); // Cmd CHAR_EFFECT
    try {
        msg.writer().writeByte(0); // 0 = Thêm hiệu ứng mới
        msg.writer().writeInt((int) player.id); // ID người chơi nhận hiệu ứng
        msg.writer().writeShort(effectId); // ID Hào quang (Ví dụ: 200)
        msg.writer().writeByte(1); // 1 = Hiển thị vĩnh viễn (0 = Tạm thời)
        msg.writer().writeByte(-1); // Thông số nâng cao (Layering y offset)
        msg.writer().writeShort(0); // Layering x offset
        
        // Gửi lệnh cho toàn bộ người chơi trong Map để họ cùng nhìn thấy
        Service.gI().sendMessAllPlayerInMap(player.zone, msg); 
    } catch (Exception e) {
        e.printStackTrace();
    } finally {
        if (msg != null) {
            msg.cleanup();
        }
    }
}
```

> **Mẹo:** Gán hàm `sendAuraEffect(player, 200)` này vào chức năng **Đeo Cải Trang**, **Đeo Danh Hiệu** hoặc khi nhân vật **Gồng KI**. Client sẽ tự động tải file từ Server và hiển thị hào quang cháy rực rỡ xung quanh người chơi!

---

## 🔥 5. Ví dụ Thực Tế: Gắn Hào Quang vào Kỹ Năng Gồng KI
Dưới đây là tài liệu hướng dẫn cách hiển thị một Aura (Ví dụ: ID 200) mỗi khi người chơi sử dụng kỹ năng Tái Tạo Năng Lượng (Gồng KI) và tự động tắt khi ngừng gồng.

### Bước 5.1: Chuẩn bị 2 hàm Bật/Tắt trong Service
Mở file `src/main/java/nro/services/Service.java`, thêm 2 hàm sau vào cuối class để gọi ở bất kỳ đâu:

```java
    // Hàm Bật Hào Quang (Gửi Packet -128 type 0)
    public void sendAuraEffect(Player player, int effectId) {
        Message msg = new Message(-128); 
        try {
            msg.writer().writeByte(0); // 0 = Thêm hiệu ứng mới
            msg.writer().writeInt((int) player.id);
            msg.writer().writeShort(effectId); // ID Hào quang
            msg.writer().writeByte(1); // 1 = Lặp liên tục (Loop)
            msg.writer().writeByte(-1);
            msg.writer().writeShort(0);
            Service.gI().sendMessAllPlayerInMap(player.zone, msg); 
        } catch (Exception e) {} finally { if (msg != null) msg.cleanup(); }
    }

    // Hàm Tắt Hào Quang (Gửi Packet -128 type 1)
    public void removeAuraEffect(Player player, int effectId) {
        Message msg = new Message(-128);
        try {
            msg.writer().writeByte(1); // 1 = Lệnh XÓA hiệu ứng
            msg.writer().writeInt((int) player.id);
            msg.writer().writeShort(effectId);
            Service.gI().sendMessAllPlayerInMap(player.zone, msg); 
        } catch (Exception e) {} finally { if (msg != null) msg.cleanup(); }
    }
```

### Bước 5.2: Bật Hào quang khi vận nội công
Mở file `src/main/java/nro/services/SkillService.java`, tìm đến đoạn xử lý kỹ năng **Gồng KI** (`case Skill.TAI_TAO_NANG_LUONG:`). Gọi hàm bật hào quang ở ngay sau khi bắt đầu charge:

```java
            case Skill.TAI_TAO_NANG_LUONG:
                EffectSkillService.gI().startCharge(player);
                
                // [THÊM MỚI] Bật hào quang số 200 khi nhân vật Gồng KI
                Service.gI().sendAuraEffect(player, 200); 

                affterUseSkill(player, player.playerSkill.skillSelect.template.id);
                break;
```

### Bước 5.3: Tắt Hào quang khi kết thúc Gồng KI
Khi nhân vật đầy KI, tự di chuyển, hoặc bị quái đánh ngã, kỹ năng Gồng KI sẽ bị ngắt. Bạn cần tắt hào quang để nhân vật không bị "cháy" mãi mãi.
Mở file `src/main/java/nro/services/EffectSkillService.java`, tìm hàm `stopCharge(Player player)` và thêm hàm xóa:

```java
    public void stopCharge(Player player) {
        player.effectSkill.isCharging = false;
        
        // [THÊM MỚI] Tắt hào quang 200 khi ngừng Gồng
        Service.gI().removeAuraEffect(player, 200); 
        
        Service.getInstance().sendPlayerInfoCharge(player);
    }
```

**Hoàn tất!** Giờ đây mỗi khi người chơi bấm nút sử dụng kỹ năng Tái tạo năng lượng, ngọn lửa Hào quang xịn xò do chính bạn tạo ra từ Tool cắt Sprite sẽ rực cháy quanh nhân vật, và tự động vụt tắt khi họ thả nút ra.
