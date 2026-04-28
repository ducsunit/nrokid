# Tài liệu hiện trạng tính năng và cốt truyện

Tài liệu này tổng hợp nhanh các tính năng gameplay/cốt truyện đang có trong server `nrokid`, đồng thời đề xuất hướng phát triển để tạo một server "khác biệt" nhưng vẫn bám sát codebase hiện tại.

## 1) Hiện trạng tính năng đang có

### 1.1 Combat và hệ thống chiến đấu
- Skill combat cốt lõi: tấn công người chơi, tấn công quái, check điều kiện PK/PVP.
  - Tham chiếu: `src/main/java/nro/services/SkillService.java`.
- Logic nhận sát thương, né/trừ damage, chết, hồi sinh.
  - Tham chiếu: `src/main/java/nro/models/player/Player.java`, `src/main/java/nro/models/mob/Mob.java`.

### 1.2 Nhân vật và tiến trình người chơi
- `Player` là trung tâm state gameplay: chỉ số, trang bị, pet, clan, bạn bè/kẻ thù, PK mode, event state.
  - Tham chiếu: `src/main/java/nro/models/player/Player.java`.
- Có hệ thống `Pet` và `MiniPet` cập nhật theo vòng lặp player.

### 1.3 Vật phẩm, trang bị, inventory
- Quản lý túi/đồ trên người/rương/tiền tệ (vàng, ngọc, ruby).
  - Tham chiếu: `src/main/java/nro/models/player/Inventory.java`.
- Dịch vụ thao tác item (mặc/đổi/chuyển vị trí/item cho pet).
  - Tham chiếu: `src/main/java/nro/services/InventoryService.java`.
- Nhặt item trên map có ràng buộc quest/event.
  - Tham chiếu: `src/main/java/nro/models/map/Zone.java`.

### 1.4 Map, zone, dungeon, boss
- Vòng lặp map/zone và điều phối mob/item/player.
  - Tham chiếu: `src/main/java/nro/models/map/Map.java`, `src/main/java/nro/models/map/Zone.java`.
- Có nhiều chế độ PvE/phó bản:
  - Con đường rắn độc: `src/main/java/nro/models/map/dungeon/SnakeRoad.java`.
  - Doanh trại: `src/main/java/nro/models/map/phoban/DoanhTrai.java`.
  - Bản đồ kho báu: `src/main/java/nro/models/map/phoban/BanDoKhoBau.java`.
  - Đại hội võ thuật challenge: `src/main/java/nro/models/map/challenge/MartialCongress.java`.
- Framework boss tổng quát + nhiều nhóm boss event/chiến trường/phó bản.
  - Tham chiếu: `src/main/java/nro/models/boss/Boss.java`.

### 1.5 Clan, social, kinh tế
- Clan đầy đủ: tạo bang, duyệt thành viên, chat bang, donate, phân quyền.
  - Tham chiếu: `src/main/java/nro/services/ClanService.java`.
- Bạn bè/kẻ thù + chat riêng + báo thù.
  - Tham chiếu: `src/main/java/nro/services/FriendAndEnemyService.java`.
- Chat thế giới có cooldown/phí/kiểm duyệt text.
  - Tham chiếu: `src/main/java/nro/services/ChatGlobalService.java`.
- Giao dịch:
  - Trade trực tiếp: `src/main/java/nro/services/func/Trade.java`.
  - Ký gửi/chợ: `src/main/java/nro/models/consignment/ConsignmentShop.java`.

### 1.6 PVP/PVE mode và sự kiện
- PVP challenge, revenge và lifecycle trận đấu.
  - Tham chiếu: `src/main/java/nro/models/pvp/PVP.java`, `ChallengePVP.java`, `RevengePVP.java`.
- Chiến trường ngọc/ball war.
  - Tham chiếu: `src/main/java/nro/models/map/war/BlackBallWar.java`, `NamekBallWar.java`.
- Có event framework + summer event triển khai thực tế.
  - Tham chiếu: `src/main/java/nro/event/Event.java`, `src/main/java/nro/event/SummerEvent.java`.

## 2) Hiện trạng cốt truyện (story content)

### 2.1 Những gì đang có
- Main quest theo chương (task main/sub task), trigger được nhiều hành vi:
  - vào map, giết mob/boss, nhặt item, nói chuyện NPC, kết bạn, vào clan.
  - Tham chiếu: `src/main/java/nro/services/TaskService.java`.
- NPC text theo tiến trình, có nhiều đoạn hội thoại điều hướng cốt truyện.
  - Tham chiếu: `src/main/java/nro/consts/ConstNpc.java`, `resources/data/nro/menunpc.txt`.
- Mở map theo mốc quest + ràng buộc sức mạnh/trang bị ở một số map.
  - Tham chiếu: `src/main/java/nro/services/func/ChangeMapService.java`.
- Có side task random hằng ngày + reward progression.
  - Tham chiếu: dữ liệu tại `Manager` load từ DB + save trong `PlayerDAO`.

### 2.2 Điểm cần lưu ý
- Dữ liệu cốt truyện gốc nằm trong DB (`task_main_template`, `task_sub_template`), không nằm đầy đủ trong repo.
  - Tham chiếu: `src/main/java/nro/server/Manager.java`.
- Chưa thấy hệ thống cutscene timeline đúng nghĩa; hiện tại chủ yếu là popup/tutorial text.
- Nhiều logic progression đang hardcode trong service/switch-case, mở rộng arc mới sẽ tốn công.

## 3) Định hướng "server khác biệt" (ý tưởng thực chiến)

## Mục tiêu
Tạo server có "bản sắc riêng", không chỉ tăng rate/drop, mà tạo vòng lặp mới: **Cốt truyện phân nhánh + hệ sinh thái phe phái + chu kỳ mùa giải**.

### Ý tưởng A: Cốt truyện phân nhánh (Branching Story Server)
- Mỗi chương có 2-3 lựa chọn (phe trung lập, phe chiến đấu, phe thương mại...).
- Lựa chọn ảnh hưởng:
  - map được mở trước/sau,
  - bộ quest tiếp theo,
  - NPC shop và reward riêng,
  - ending theo season.
- Kỹ thuật:
  - thêm `story_branch` vào state player (có thể đặt trong `TaskPlayer`/bảng riêng).
  - thêm layer check branch trong `TaskService` + `ChangeMapService`.

### Ý tưởng B: Hệ thống "Liên minh hành tinh"
- Thay vì clan chỉ là chat/doanh trại, bổ sung "phe hành tinh" (Earth/Namek/Saiyan factions) có điểm ảnh hưởng server.
- Hoạt động:
  - daily war nhiệm vụ theo phe,
  - world buff theo phe đang thắng,
  - boss xuất hiện theo phe control zone.
- Tận dụng code sẵn có:
  - war map, boss spawn, event drop.

### Ý tưởng C: Seasonal Story (mỗi 6-8 tuần một arc)
- Mỗi season có:
  - 1 chương cốt truyện ngắn,
  - 1 boss world mới,
  - 1 bộ item set event,
  - reset bảng xếp hạng season (giữ progression dài hạn qua token/perk).
- Lợi ích:
  - giữ người chơi quay lại theo chu kỳ,
  - dễ truyền thông server và tạo hype.

### Ý tưởng D: Rogue-like dungeon theo tuần
- Thêm "Hang không gian" 10 tầng ngẫu nhiên:
  - mỗi tầng có modifier (giảm hồi máu, tăng sát thương boss, cấm skill X...),
  - reward theo mốc tầng + leaderboard.
- Tận dụng:
  - khung map/zone/dungeon hiện có, bổ sung random rule generator.

### Ý tưởng E: Kinh tế động, anti-lạm phát
- Dynamic sink:
  - phí nâng cấp, phí giao dịch, phí dịch vụ event thay đổi theo lượng vàng server.
- Dynamic source:
  - điều chỉnh drop vàng/ngọc theo cohort level.
- Mục tiêu: giữ cho kinh tế bền vững, tránh "vàng vô giá trị".

## 4) Backlog đề xuất theo 3 giai đoạn

### Giai đoạn 1 (2-3 tuần): Nền tảng
- Trích ly và tái cấu trúc progression:
  - tách config map-gate/task-gate ra khỏi hardcode.
- Chuẩn hóa event script:
  - event nào theo framework `Event`, event nào trong `NpcFactory`.
- Bổ sung schema dữ liệu story branch.

### Giai đoạn 2 (3-5 tuần): Feature khác biệt đầu tiên
- Triển khai Branching Story cho 1 arc ngắn (POC).
- Triển khai 1 dungeon rogue-like bản đơn giản.
- Thêm rank/phần thưởng theo season.

### Giai đoạn 3 (5-8 tuần): Scale và vận hành
- Thêm dashboard cân bằng kinh tế (drop/sink/lưu thông).
- Chuẩn hóa content pipeline:
  - NPC text, quest text, reward table thành data file hoặc DB tool.
- Mở rộng 2-3 arc tiếp theo theo season.

## 5) Đề xuất kỹ thuật cụ thể (để dễ code và bảo trì)

- Tách "story content" khỏi code:
  - text NPC, reward, điều kiện map vào data template.
- Giảm hardcode:
  - dùng rule engine nhỏ cho trigger quest (kill, collect, talk, travel).
- Tạo "content version":
  - player lưu version quest/story để migrate an toàn khi update season.
- Bổ sung test:
  - unit test cho gate logic map/task,
  - smoke test cho flow quest 0->N.

## 6) Kết luận nhanh

Codebase hiện tại đã có nền gameplay đủ mạnh (combat, pve/pvp, event, clan, dungeon). Điểm "khác biệt" nên đặt ở lớp **cốt truyện có lựa chọn + season hóa nội dung + kinh tế động**. Đây là 3 trục để server có bản sắc riêng, giữ người chơi lâu dài, và vẫn tận dụng được khung code sẵn có.
