# Tài liệu chi tiết Ý tưởng A: Cốt truyện phân nhánh (Branching Story Server)

Tài liệu này chi tiết hóa Ý tưởng A trong `README_STORY_FEATURES_AND_IDEAS.md` theo hướng có thể triển khai thật trên codebase hiện tại.

---

## 1) Mục tiêu sản phẩm

Tạo hệ cốt truyện mà mỗi người chơi phải đưa ra lựa chọn ở các mốc chương, từ đó ảnh hưởng trực tiếp đến:
- Map được mở sớm/muộn.
- Chuỗi quest tiếp theo.
- NPC shop, reward và vật phẩm nhận được.
- Kết cục season của nhân vật.

Mục tiêu là tạo trải nghiệm "chơi lại vẫn mới", thay vì chỉ tăng chỉ số hoặc tăng tỉ lệ rơi đồ.

---

## 2) Triết lý thiết kế

### 2.1 Dễ hiểu cho người chơi
- Mỗi chương chỉ có 2-3 nhánh.
- Quyết định tại mốc rõ ràng, có cảnh báo "lựa chọn này ảnh hưởng hướng phát triển".
- Không ép người chơi đọc quá nhiều text trong một lần.

### 2.2 Dễ vận hành cho admin
- Nội dung phân nhánh được data hóa, không hardcode sâu trong `switch-case`.
- Có thể bật/tắt nhánh theo season bằng cấu hình.
- Có log để biết người chơi đang ở nhánh nào.

### 2.3 Không phá cân bằng
- Nhánh khác nhau về cách chơi, không chênh lệch quá lớn về power.
- Reward có độ khác biệt "hướng build", không tạo nhánh bắt buộc.

---

## 3) Thiết kế gameplay chi tiết

## 3.1 Khung chương và nhánh

Mỗi chương gồm 4 phần:
1. **Khởi động chương**: người chơi nhận tín hiệu story mới từ NPC.
2. **Nút quyết định**: chọn 1 trong 2-3 hướng.
3. **Chuỗi nhiệm vụ nhánh**: 3-5 subquest theo nhánh đã chọn.
4. **Đóng chương**: nhận thưởng, mở map/quest chương kế.

Ví dụ chương 1:
- Nhánh A1: Phe Chiến Đấu (đánh boss, farm map nguy hiểm).
- Nhánh A2: Phe Thương Mại (thu thập, trao đổi, giao dịch NPC).
- Nhánh A3: Phe Trung Lập (hỗn hợp PvE + xã hội/clan).

## 3.2 Ảnh hưởng của nhánh

- **Map mở khác nhau**:
  - A1 mở map chiến đấu sớm.
  - A2 mở khu thương nhân/săn tài nguyên sớm.
  - A3 mở map trung gian trước.
- **Quest khác nhau**:
  - Mục tiêu kill/collect/talk khác nhau.
- **NPC và shop khác nhau**:
  - Cùng một NPC nhưng menu khác theo nhánh.
- **Reward khác nhau**:
  - A1 thiên công.
  - A2 thiên kinh tế/tài nguyên.
  - A3 thiên cân bằng/sinh tồn.

## 3.3 Cơ chế đổi nhánh

Đề xuất cho mùa đầu:
- Cho đổi nhánh 1 lần/chương, có chi phí (vàng/ngọc + item reset).
- Không cho đổi nhánh ở cuối chương (tránh lạm dụng nhận thưởng cả hai).
- Khi đổi nhánh:
  - reset tiến độ subquest nhánh hiện tại,
  - giữ tiến độ chương tổng.

---

## 4) Kiến trúc dữ liệu đề xuất

Vì dữ liệu quest hiện nằm nhiều trong DB, nên bổ sung các bảng/field sau:

## 4.1 Bảng trạng thái nhánh của người chơi

`player_story_branch`
- `player_id` (bigint)
- `season_id` (int)
- `chapter_id` (int)
- `branch_id` (varchar)
- `chosen_at` (timestamp)
- `changed_count` (int)
- `is_locked` (tinyint)

Mục đích:
- lưu nhánh đã chọn theo chương, theo season.

## 4.2 Bảng cấu hình nhánh

`story_branch_config`
- `season_id`
- `chapter_id`
- `branch_id`
- `branch_name`
- `description`
- `unlock_condition_json`
- `next_task_main_id`
- `map_gate_json`
- `npc_menu_profile`
- `reward_profile`
- `is_active`

Mục đích:
- data hóa logic thay vì hardcode.

## 4.3 Bảng kết cục season

`player_story_ending`
- `player_id`
- `season_id`
- `ending_id`
- `score_combat`
- `score_economy`
- `score_social`
- `generated_at`

Mục đích:
- tạo ending theo hành vi/chọn nhánh.

---

## 5) Tích hợp vào codebase hiện tại

## 5.1 Điểm tích hợp chính

- `TaskService`:
  - kiểm tra branch trước khi trả quest kế.
  - check done task theo nhánh.
- `ChangeMapService`:
  - check branch trước khi mở map.
- `NpcFactory` hoặc lớp điều phối menu NPC:
  - render menu khác nhau theo `branch_id`.
- `PlayerDAO`:
  - load/save trạng thái nhánh.
- `Manager`:
  - load cấu hình branch khi khởi động server.

## 5.2 Interface gợi ý

```java
public interface StoryBranchService {
    String getCurrentBranch(Player player, int seasonId, int chapterId);
    boolean chooseBranch(Player player, int seasonId, int chapterId, String branchId);
    boolean canAccessMap(Player player, int mapId);
    int resolveNextTaskMainId(Player player, int currentTaskMainId);
}
```

## 5.3 Rule check map/quest

Luồng kiểm tra đề xuất:
1. Lấy `branch_id` hiện tại của player theo chapter.
2. Từ `story_branch_config`, đọc rule map/quest tương ứng.
3. Nếu pass rule -> cho đi map/nhận quest.
4. Nếu fail -> trả tutorial popup chỉ dẫn.

---

## 6) Thiết kế content (để đội nội dung làm việc)

## 6.1 Mỗi chương cần chuẩn bị

- 1 đoạn mở chương (NPC intro).
- 2-3 nhánh, mỗi nhánh:
  - 1 đoạn giới thiệu,
  - 3-5 nhiệm vụ,
  - 1 trận hoặc 1 mục tiêu kết chương,
  - 1 gói reward.
- 1 đoạn đóng chương + gợi mở chương sau.

## 6.2 Mẫu định nghĩa nhiệm vụ nhánh

```json
{
  "season_id": 1,
  "chapter_id": 1,
  "branch_id": "combat",
  "tasks": [
    {"type": "kill_mob", "target": 123, "count": 30},
    {"type": "talk_npc", "target": 17},
    {"type": "kill_boss", "target": 9001, "count": 1}
  ],
  "reward_profile": "reward_combat_c1"
}
```

---

## 7) Cân bằng phần thưởng theo nhánh

Đề xuất nguyên tắc:
- Tổng "giá trị kinh tế" của các nhánh gần bằng nhau.
- Chỉ khác **hướng lợi ích**, không khác quá mạnh về tổng lực.

Ví dụ:
- Nhánh Chiến Đấu:
  - nhiều nguyên liệu nâng công, ít tài nguyên giao dịch.
- Nhánh Thương Mại:
  - nhiều token đổi đồ, nhiều vàng/ngọc, ít stat trực tiếp.
- Nhánh Trung Lập:
  - reward đa dụng, không cực trị.

KPI chênh lệch cho phép:
- DPS trung bình giữa các nhánh: lệch tối đa 10-15%.
- Tốc độ farm tài nguyên: lệch tối đa 15-20%.

---

## 8) UI/UX và truyền thông trong game

## 8.1 Tại thời điểm chọn nhánh

- Popup rõ:
  - Nhánh này mạnh ở đâu.
  - Nhược điểm chính.
  - Có/không cho đổi lại.

## 8.2 Trong quá trình chơi

- Hiển thị nhánh hiện tại trong info nhân vật hoặc title nhỏ.
- Nếu người chơi vào map bị khóa do nhánh:
  - thông báo lý do + hướng dẫn map/quest đúng.

## 8.3 Cuối season

- NPC tổng kết:
  - bạn đã theo nhánh nào,
  - đóng góp chính,
  - ending nhận được.

---

## 9) Logging và quan sát dữ liệu

Để tránh làm xong nhưng khó cân bằng, cần log:
- Tỉ lệ chọn nhánh theo ngày.
- Tỉ lệ bỏ dở chương theo nhánh.
- Time-to-complete mỗi nhánh.
- Chênh lệch sức mạnh trung bình giữa nhánh.
- Số lần đổi nhánh và điểm rơi thời gian.

Dashboard tối thiểu:
- Biểu đồ phân bố branch.
- Funnel hoàn thành chapter theo branch.
- Top reward inflow theo branch.

---

## 10) Roadmap triển khai chi tiết

## Giai đoạn 1: Nền tảng kỹ thuật (1-2 tuần)
- Tạo schema DB cho `player_story_branch` và `story_branch_config`.
- Viết service load config branch.
- Tạo API/service đọc branch theo player/chapter.
- Chèn điểm hook vào `TaskService` và `ChangeMapService`.

## Giai đoạn 2: POC 1 chương (2-3 tuần)
- Làm 1 chương có 2 nhánh (để giảm rủi ro).
- Tạo 3-4 quest mỗi nhánh.
- Tạo reward profile riêng.
- Test nội bộ end-to-end.

## Giai đoạn 3: Vận hành season thật (3-4 tuần)
- Nâng lên 3 nhánh/chương.
- Thêm cơ chế đổi nhánh có điều kiện.
- Thêm ending và tổng kết season.
- Bật dashboard và theo dõi KPI.

---

## 11) Rủi ro và cách giảm thiểu

- **Rủi ro mất cân bằng nhánh**:
  - Giảm bằng cách cân theo KPI, không cân theo cảm giác.
- **Rủi ro quá nhiều hardcode**:
  - Ép buộc cấu hình branch phải data-driven.
- **Rủi ro migration player cũ**:
  - Nếu chưa có branch thì gán `branch_id = neutral` mặc định.
- **Rủi ro người chơi chọn sai rồi bỏ game**:
  - Cho 1 lần đổi nhánh miễn phí trong chương đầu.

---

## 12) Checklist nghiệm thu

- [ ] Người chơi chọn được nhánh ở chapter chỉ định.
- [ ] Quest và map mở đúng theo nhánh.
- [ ] NPC/shop trả đúng menu theo nhánh.
- [ ] Reward đúng profile, không nhận chéo.
- [ ] Đổi nhánh đúng rule, không bug nhân đôi thưởng.
- [ ] Log branch và dashboard hoạt động.
- [ ] Không có chênh lệch sức mạnh vượt ngưỡng KPI.

---

## 13) Kết luận

Ý tưởng A có thể trở thành trụ cột khác biệt cho server nếu triển khai theo hướng:
- nhánh ít nhưng rõ,
- data hóa nội dung và rule,
- giám sát bằng KPI thực chiến.

Với kiến trúc trên, đội dev có thể mở rộng thêm chapter/season mà không phải sửa sâu logic cũ mỗi lần cập nhật.
