# Tài liệu cân bằng bảng chỉ số (mức trung bình, không quá ảo)

Mục tiêu tài liệu này là đưa ra khung cân bằng chỉ số để server vận hành ổn định, PvE/PvP dễ thở, hạn chế power creep và tránh tình trạng người chơi "one hit" quá sớm.

Tài liệu bám theo cách tính hiện tại trong code, sau đó đề xuất ngưỡng triển khai thực tế.

## 1) Cơ chế tính chỉ số hiện tại trong code

### 1.1 Nơi tính tổng chỉ số
- Tổng hợp chỉ số nằm trong `src/main/java/nro/models/player/NPoint.java`.
- Chuỗi tính chính:
  - `setPoint()` cộng option item vào các nhóm stat.
  - `setBasePoint()` gọi `setHpMax()`, `setMpMax()`, `setDame()`, `setDef()`, `setCrit()`, ...
  - `getDameAttack()` tính damage theo skill, chí mạng, buff, nội tại.

### 1.2 Một số quy tắc quan trọng đang có
- Giảm sát thương theo % (`tlGiamst`) đang bị chặn cứng tối đa `60%` ở `setDef()`.
- Né đòn (`tlNeDon`) chưa có chặn cứng trong `NPoint` (chỉ cộng dồn).
- Chí mạng (`crit`) chưa chặn cứng; kiểm tra tỉ lệ theo `Util.isTrue(crit, 100)`, nên nếu `crit > 100` gần như luôn chí mạng.
- Sát thương nhận vào trừ giáp theo `subDameInjureWithDeff()`:
  - `damage -= def`, sau đó áp dụng các hiệu ứng giảm thêm.
- Sát thương cuối có dao động ngẫu nhiên +-5% trong `getDameAttack()`.

## 2) Option chỉ số chính (theo id) cần kiểm soát

Tham chiếu mapping ở `NPoint.setPoint()`:

| Option ID | Ý nghĩa chính | Nhóm cân bằng |
|---|---|---|
| `0` | Tấn công thô | Công |
| `14` | Chí mạng % | Công bùng nổ |
| `47` | Giáp thô | Thủ |
| `22` | HP theo K | Sinh tồn |
| `23` | MP theo K | Tài nguyên |
| `49`, `50`, `147` | % Sức đánh | Công |
| `77` | % HP | Sinh tồn |
| `94` | % Giáp | Thủ |
| `95`, `104` | Hút HP | Hồi phục |
| `96` | Hút MP | Hồi phục |
| `97` | Phản sát thương % | Phản công |
| `108` | Né đòn % | Né tránh |
| `80`, `81` | Hồi HP/MP % mỗi chu kỳ | Sustain |

## 3) Trần đề xuất để "không ảo"

Lưu ý: đây là **trần thiết kế server** (policy), không phải trần cứng code hiện tại.

| Chỉ số | Trần đề xuất | Lý do |
|---|---|---|
| Chí mạng (`crit`) | `<= 75%` (hard cap vận hành) | Tránh luôn crit, giữ giá trị build đa dạng |
| Né đòn (`tlNeDon`) | `<= 35%` | Né cao quá làm PvP may rủi |
| Giảm sát thương % (`tlGiamst`) | `<= 60%` | Đang có chặn sẵn trong code |
| Phản sát thương (`tlPST`) | `<= 20%` | Tránh meta tự chết khi đánh |
| Hút HP tổng (PVP) | `<= 12%` | Tránh đấu kéo vô tận |
| Hút HP tổng (PVE) | `<= 20%` | Giữ cảm giác farm đã tay nhưng không bất tử |
| Tăng dame từ buff ngắn hạn cộng dồn | `<= +120%` | Hạn chế combo one-shot |
| Hồi HP/MP chu kỳ (30s) | `<= 8% HP/MP tối đa` | Tránh sustain vượt ngưỡng sát thương |

## 4) Bảng chỉ số mục tiêu theo giai đoạn

Đây là bảng mục tiêu cho **người chơi trung bình** (không full đồ hiếm nhất, không stack full buff event).

| Giai đoạn | HP | MP | Dame sheet | Def | Crit | Né đòn |
|---|---:|---:|---:|---:|---:|---:|
| Early game | 80k - 250k | 60k - 200k | 8k - 35k | 1.2k - 4k | 8% - 20% | 0% - 8% |
| Mid game | 250k - 900k | 180k - 700k | 35k - 140k | 4k - 12k | 20% - 40% | 8% - 18% |
| End game (trung bình) | 900k - 2.5m | 700k - 2.0m | 140k - 450k | 12k - 30k | 40% - 60% | 18% - 28% |
| End game (cận trần) | 2.5m - 4.0m | 2.0m - 3.2m | 450k - 700k | 30k - 45k | 60% - 75% | 28% - 35% |

## 5) KPI cân bằng để kiểm tra "ảo hay không"

Dùng KPI hành vi thay vì chỉ nhìn stat sheet:

| Tình huống test | Mục tiêu cân bằng |
|---|---|
| Solo quái thường cùng tier | 2 - 4 hit |
| Solo quái tinh anh | 6 - 12 hit |
| Solo boss map thường | 45 - 90 giây |
| 1v1 cùng tier (không full consumable) | 20 - 60 giây |
| Chênh lệch thắng giữa build meta và build lệch | Không quá 65/35 |

Nếu lệch xa các KPI trên, thường là dấu hiệu chỉ số đã quá ảo hoặc quá cùi.

## 6) Quy tắc phân bổ chỉ số theo vai trò build

### 6.1 Build cân bằng (khuyến nghị mặc định)
- 45% ngân sách option vào công.
- 35% vào sinh tồn.
- 20% vào utility (né, hút, hồi).

### 6.2 Build công (glass cannon vừa phải)
- Crit tối đa theo policy: 75%.
- Né đòn không vượt 20%.
- Bắt buộc có ngưỡng HP tối thiểu theo tier (không thấp hơn 80% mốc trung bình tier).

### 6.3 Build thủ/sustain
- Không vượt 60% giảm sát thương.
- Hút HP PVP không vượt 12%.
- Không cộng đồng thời quá nhiều phản sát thương + hồi phục + né đòn.

## 7) Gợi ý áp dụng vào dữ liệu item (thực thi)

### 7.1 Chuẩn hóa theo "ngân sách chỉ số" mỗi tier
- Mỗi tier item định nghĩa `budget point` cố định.
- Option công/thủ/utility tiêu tốn budget khác nhau.
- Item hiếm tăng độ linh hoạt option, không tăng budget quá mạnh.

### 7.2 Chặn cứng ở tầng tính điểm
- Tại cuối `setBasePoint()` hoặc ngay trước combat:
  - clamp `crit`, `tlNeDon`, `tlPST`, tổng hút HP theo policy.
- Vì code hiện chưa clamp một số chỉ số, đây là bước quan trọng để tránh build lỗi.

### 7.3 Tách buff ngắn hạn và chỉ số nền
- Chỉ số nền (gear) nên quyết định ~70% sức mạnh.
- Buff ngắn hạn (event, consumable) chỉ đóng góp ~30% để tránh bùng nổ bất thường.

## 8) Checklist vận hành cân bằng mỗi lần update

- Sau mỗi patch item/combine/event:
  - Chạy test KPI ở mục 5.
  - So sánh median time-kill, median trận PvP.
  - Nếu time-kill giảm >20% so với patch trước: hạ budget công hoặc hạ crit.
  - Nếu time-kill tăng >25%: tăng nhẹ dame nền hoặc giảm phòng thủ.

## 9) Thử nghiệm một vài case mẫu

Các case dưới đây dùng để tham chiếu nhanh. Mục tiêu là kiểm tra xem build đang nằm ở vùng "trung bình" hay đã vượt ngưỡng.

### 9.1 Case A - Early game cân bằng

| Chỉ số | Giá trị test | Mốc mục tiêu | Đánh giá |
|---|---:|---:|---|
| HP | 180k | 80k - 250k | Đạt |
| MP | 140k | 60k - 200k | Đạt |
| Dame | 24k | 8k - 35k | Đạt |
| Def | 2.8k | 1.2k - 4k | Đạt |
| Crit | 16% | 8% - 20% | Đạt |
| Né đòn | 6% | 0% - 8% | Đạt |

Kỳ vọng thực chiến:
- Quái thường cùng tier: khoảng 3 hit.
- Quái tinh anh: khoảng 8-10 hit.
- 1v1 cùng tier: khoảng 40-55 giây.

### 9.2 Case B - Mid game công vừa

| Chỉ số | Giá trị test | Mốc mục tiêu | Đánh giá |
|---|---:|---:|---|
| HP | 520k | 250k - 900k | Đạt |
| MP | 430k | 180k - 700k | Đạt |
| Dame | 105k | 35k - 140k | Đạt |
| Def | 8.5k | 4k - 12k | Đạt |
| Crit | 37% | 20% - 40% | Đạt |
| Né đòn | 15% | 8% - 18% | Đạt |

Kỳ vọng thực chiến:
- Quái thường cùng tier: 2-3 hit.
- Quái tinh anh: 6-8 hit.
- Boss map thường: 55-80 giây.
- 1v1 cùng tier: 25-40 giây.

### 9.3 Case C - End game trung bình (khuyến nghị)

| Chỉ số | Giá trị test | Mốc mục tiêu | Đánh giá |
|---|---:|---:|---|
| HP | 1.9m | 900k - 2.5m | Đạt |
| MP | 1.4m | 700k - 2.0m | Đạt |
| Dame | 320k | 140k - 450k | Đạt |
| Def | 24k | 12k - 30k | Đạt |
| Crit | 55% | 40% - 60% | Đạt |
| Né đòn | 24% | 18% - 28% | Đạt |

Kỳ vọng thực chiến:
- Quái thường cùng tier: 2 hit.
- Quái tinh anh: 6-7 hit.
- Boss map thường: 45-70 giây.
- 1v1 cùng tier: 20-35 giây.

### 9.4 Case D - End game cận trần nhưng chưa ảo

| Chỉ số | Giá trị test | Mốc mục tiêu | Đánh giá |
|---|---:|---:|---|
| HP | 3.4m | 2.5m - 4.0m | Đạt |
| MP | 2.7m | 2.0m - 3.2m | Đạt |
| Dame | 620k | 450k - 700k | Đạt |
| Def | 39k | 30k - 45k | Đạt |
| Crit | 72% | <= 75% policy | Đạt |
| Né đòn | 33% | <= 35% policy | Đạt |

Kỳ vọng thực chiến:
- Boss map thường: 35-55 giây (nhanh, nhưng chưa one-shot).
- 1v1 cùng tier: 15-28 giây (đã khá căng).

### 9.5 Case E - Build "ảo" cần nerf

| Chỉ số | Giá trị test | Trần policy | Đánh giá |
|---|---:|---:|---|
| HP | 5.8m | 4.0m (cận trần khuyến nghị) | Vượt |
| Dame | 980k | 700k (cận trần khuyến nghị) | Vượt |
| Crit | 95% | 75% | Vượt |
| Né đòn | 48% | 35% | Vượt |
| Hút HP PVP | 20% | 12% | Vượt |
| Buff dame cộng dồn | +180% | +120% | Vượt |

Dấu hiệu thực chiến:
- Quái thường, quái tinh anh gần như 1 hit.
- Boss map thường < 25 giây.
- 1v1 cùng tier < 10-12 giây.

Hướng xử lý:
- Clamp crit về 75%, né về 35%.
- Giảm hút HP PVP xuống tối đa 12%.
- Hạ tổng buff dame ngắn hạn về <= +120%.
- Giảm budget option công 10-15% ở tier đang lỗi.

### 9.6 Cách dùng các case này khi test bản mới

- Bước 1: Chụp chỉ số nhân vật mẫu trước patch và sau patch.
- Bước 2: Đối chiếu với case gần nhất theo tier.
- Bước 3: Chạy KPI mục 5 để xác nhận bằng thời gian hạ mục tiêu.
- Bước 4: Nếu lệch >20% so với case mục tiêu, chỉnh budget ngay trong patch kế.

## 10) Preset số cụ thể để thêm đồ/mob/boss

Phần này là bộ số "dùng được ngay" khi bạn thêm content mới.

Lưu ý:
- Đây là preset cho server theo hướng trung bình, không one-shot.
- Khi test thực tế có thể dao động +-10%.

### 10.1 Chỉ số item theo tier (điền option khi tạo đồ)

Áp cho nhóm option chính:
- `0`: Dame thô
- `22`: HP (K)
- `23`: MP (K)
- `47`: Def thô
- `14`: Crit
- `108`: Né đòn

| Tier | `0` Dame | `22` HP(K) | `23` MP(K) | `47` Def | `14` Crit | `108` Né |
|---|---:|---:|---:|---:|---:|---:|
| T1 (early) | 2,500 - 5,000 | 35 - 60 | 30 - 55 | 700 - 1,500 | 8 - 14 | 0 - 4 |
| T2 (mid-) | 5,000 - 9,000 | 60 - 110 | 50 - 95 | 1,500 - 2,800 | 12 - 18 | 3 - 7 |
| T3 (mid+) | 9,000 - 15,000 | 110 - 180 | 95 - 160 | 2,800 - 4,500 | 16 - 24 | 6 - 10 |
| T4 (end-) | 15,000 - 28,000 | 180 - 300 | 160 - 260 | 4,500 - 8,000 | 20 - 30 | 8 - 14 |
| T5 (end) | 28,000 - 45,000 | 300 - 500 | 260 - 420 | 8,000 - 12,000 | 24 - 36 | 12 - 18 |

Gợi ý set item 5 món:
- Áo: ưu tiên `47`
- Quần: ưu tiên `22`
- Găng: ưu tiên `0`
- Giày: ưu tiên `23`
- Nhẫn: ưu tiên `14` + phụ 1 option utility

### 10.2 Option phụ và trần an toàn khi thêm đồ mới

| Option | Khuyến nghị mỗi món | Trần tổng nhân vật |
|---|---:|---:|
| `% Dame` (`49/50/147`) | 5 - 12% | <= 120% từ buff ngắn hạn |
| `% HP` (`77`) | 4 - 10% | không cần cap cứng, theo mốc HP mục 4 |
| `% Def` (`94`) | 3 - 8% | `tlGiamst` thực chiến <= 60% |
| Hút HP (`95/104`) | 2 - 6% | PVP <= 12%, PVE <= 20% |
| Hút MP (`96`) | 2 - 6% | <= 15% |
| Phản sát thương (`97`) | 2 - 5% | <= 20% |
| Né đòn (`108`) | 2 - 6% | <= 35% |

### 10.3 Preset quái theo map tier

| Nhóm quái | HP | Dame/hit | Def | Né | Crit |
|---|---:|---:|---:|---:|---:|
| Quái thường T1 | 30k - 60k | 1.5k - 3k | 200 - 500 | 0 - 2% | 2 - 5% |
| Quái thường T2 | 60k - 140k | 3k - 7k | 500 - 1,200 | 1 - 3% | 3 - 7% |
| Quái thường T3 | 140k - 300k | 7k - 16k | 1,200 - 2,500 | 2 - 4% | 4 - 8% |
| Quái thường T4 | 300k - 700k | 16k - 35k | 2,500 - 5,000 | 3 - 5% | 5 - 10% |
| Quái thường T5 | 700k - 1.5m | 35k - 75k | 5,000 - 9,000 | 4 - 6% | 6 - 12% |
| Quái tinh anh | x3 - x5 quái thường | x1.8 - x2.5 | x1.5 - x2 | +2% | +3% |

### 10.4 Preset boss theo tier (để không quá ảo)

| Boss tier | HP | Dame/hit | Def | Cơ chế |
|---|---:|---:|---:|---|
| Boss T1 | 1.2m - 2.5m | 8k - 15k | 1.5k - 3k | 1 kỹ năng đơn |
| Boss T2 | 2.5m - 6m | 15k - 30k | 3k - 6k | 1 AOE nhẹ + 1 buff |
| Boss T3 | 6m - 15m | 30k - 60k | 6k - 12k | 2 cơ chế luân phiên |
| Boss T4 | 15m - 35m | 60k - 110k | 12k - 22k | 2-3 cơ chế + summon |
| Boss T5 | 35m - 80m | 110k - 180k | 22k - 35k | phase + anti-burst |

Rule nhanh:
- Solo boss thường: 45 - 90 giây.
- Party 3-5 người: 25 - 50 giây.
- Nếu <30 giây solo ở tier tương ứng: boss đang quá giấy.

### 10.5 Preset dame giữa player với nhau (PvP)

Để trận PvP không kết thúc quá nhanh:
- Mid game: mục tiêu `4 - 8% HP đối thủ / hit`.
- End game trung bình: `5 - 10% HP / hit`.
- End game cận trần: `7 - 12% HP / hit` (chỉ trong burst ngắn).

Nếu vượt `15% HP/hit` ổn định -> nên giảm crit, giảm buff dame, hoặc tăng thủ nhẹ.

### 10.6 Tỉ lệ rơi đồ đề xuất (quái/boss/player)

#### Quái thường
- Vàng: `70 - 90%`
- Nguyên liệu thường: `20 - 35%`
- Trang bị trắng/xanh: `1.5 - 4%`
- Trang bị tím: `0.2 - 0.8%`
- Trang bị cam/đỏ: `0.02 - 0.08%`

#### Quái tinh anh
- Vàng: `100%`
- Nguyên liệu: `45 - 70%`
- Trang bị tím: `1 - 2.5%`
- Trang bị cam: `0.15 - 0.4%`
- Mảnh hiếm: `0.5 - 1.5%`

#### Boss thường
- Rơi item chắc chắn: `1`
- Bảng rơi phụ:
  - Nguyên liệu hiếm: `35 - 60%`
  - Trang bị tím tốt: `20 - 35%`
  - Trang bị cam: `2 - 6%`
  - Vật phẩm rất hiếm: `0.3 - 1.2%`

#### Boss sự kiện/season
- Rơi token event: `100%` (1-3 token)
- Item season cơ bản: `10 - 18%`
- Item season hiếm: `1 - 3%`
- Item season cực hiếm: `0.1 - 0.5%`

#### Khi hạ player (PK/PvP map)
- Không khuyến nghị rơi trang bị trực tiếp.
- Nên rơi:
  - điểm danh vọng: `100%`
  - token PvP: `40 - 70%`
  - rương PvP: `3 - 8%`

### 10.7 Công thức scale nhanh khi ra map mới

Bạn có thể dùng công thức này để scale từ map trước:
- `HP_quai_moi = HP_quai_cu * 1.28`
- `Dame_quai_moi = Dame_quai_cu * 1.18`
- `HP_boss_moi = HP_boss_cu * 1.35`
- `Dame_boss_moi = Dame_boss_cu * 1.20`
- `Drop_hiếm_moi = Drop_hiếm_cu * 0.9` (nếu map mới farm nhanh hơn)

### 10.8 Checklist khi thêm đồ mới

- [ ] Tổng crit nhân vật test không vượt 75%.
- [ ] Tổng né đòn không vượt 35%.
- [ ] Hút HP PVP không vượt 12%.
- [ ] Solo boss đúng mốc 45 - 90 giây.
- [ ] Quái thường không chết dưới 2 hit với build trung bình.
- [ ] Tỉ lệ rơi item hiếm không vượt khuyến nghị mục 10.6.

## 11) Kết luận

Để chỉ số "trung bình, không ảo", cần quản lý theo 3 lớp:
- **Lớp công thức**: hiểu rõ cách cộng dồn từ `NPoint`.
- **Lớp policy**: đặt trần vận hành cho crit/né/hút/giảm dmg.
- **Lớp KPI thực chiến**: cân bằng theo thời gian hạ mục tiêu, không cân bằng bằng cảm giác.

Áp dụng đúng 3 lớp này sẽ giúp server ổn định meta, tránh phá game khi thêm đồ/event mới.

---

## 12) Bảng chi tiết công thức server hiện tại

Phần này mô tả theo logic đang chạy trong code (`NPoint`, `SkillService`, `Player.injured`).

### 12.1 Bảng chỉ số nền sau khi `calPoint()`

| Chỉ số | Công thức tổng quát | Ghi chú |
|---|---|---|
| `HP_max` | `hpg + hpAdd` rồi cộng dồn các `%HP`/buff/effect/set/chuyển sinh/title/hợp thể | Tính trong `setHpMax()` của `NPoint` |
| `MP_max` | `mpg + mpAdd` rồi cộng dồn các `%MP`/buff/effect/set/chuyển sinh/title/hợp thể | Tính trong `setMpMax()` |
| `Dame_sheet` | `dameg + dameAdd` rồi cộng dồn `%dame`/buff/effect/set/chuyển sinh/title | Tính trong `setDame()` |
| `Def_sheet` | `def = defg * 4 + defAdd` | Tính trong `setDef()` |
| `Crit_rate` | `crit = critg + critAdd + buff` | Một số trạng thái set thẳng crit cao (ví dụ khỉ/biến hình) |
| `tlGiamst` | Tổng `%giảm dmg` từ option giáp | Cap cứng `60%` |
| `tlNeDon` | Tổng `%né` từ option/buff | Chưa cap cứng tổng quát trong `NPoint` |

### 12.2 Mapping option item chính (đang cộng ở `setPoint()`)

| Option ID | Tác dụng |
|---|---|
| `0` | + Dame thô |
| `14` | + Crit % |
| `22` | + HP theo K |
| `23` | + MP theo K |
| `47` | + Def thô |
| `49`, `50`, `147` | +% Dame |
| `77` | +% HP |
| `94` | +% Giáp (đi vào `tlGiamst`) |
| `95` | Hút HP theo dame |
| `96` | Hút MP theo dame |
| `97` | Phản sát thương % |
| `104` | Hút HP khi đánh quái |
| `108` | Né đòn % |
| `80`, `81` | Hồi HP/MP theo chu kỳ |

### 12.3 Công thức gây sát thương khi đánh (`getDameAttack()`)

| Bước | Công thức |
|---|---|
| 1 | `dameAttack = Dame_sheet` |
| 2 | Áp `%damage` của skill: `dameAttack = dameAttack * skillPercent` (theo skill) |
| 3 | Áp nội tại/buff sau skill: `+ percentDameIntrinsic + dameAfter + ...` |
| 4 | Nếu đánh quái: cộng thêm `%dame đánh quái` |
| 5 | Nếu crit: `dameAttack = dameAttack * 2`, rồi cộng thêm `%dame crit` |
| 6 | Dao động ngẫu nhiên khoảng `+-5%` qua `Util.nextdame()` |

### 12.4 Công thức nhận sát thương (`Player.injured()` + `subDameInjureWithDeff()`)

| Bước | Công thức |
|---|---|
| 1 | Check né (nếu không xuyên): xác suất theo `tlNeDon` |
| 2 | Trừ giáp thô: `damage = damage - def` |
| 3 | Áp giảm thêm từ hiệu ứng đặc biệt (khiên/giáp phụ...) |
| 4 | Áp giảm %: `damage = damage - damage * tlGiamst/100` |
| 5 | Ép ngưỡng tối thiểu rồi trừ vào HP |

### 12.5 Công thức tăng điểm tiềm năng (`increasePoint()`)

| Loại tăng | Công thức chi phí (rút gọn) | Giới hạn |
|---|---|---|
| HP (`type 0`) | Tăng theo cấp số cộng, mỗi điểm +20 HP gốc | Chặn bởi `power_limit.hp` |
| MP (`type 1`) | Tăng theo cấp số cộng, mỗi điểm +20 MP gốc | Chặn bởi `power_limit.mp` |
| Dame (`type 2`) | Chi phí tăng theo mức `dameg` hiện tại | Chặn bởi `power_limit.damage` |
| Def (`type 3`) | Chi phí tăng theo mức `defg` hiện tại | Chặn bởi `power_limit.defense` |
| Crit (`type 4`) | Chi phí lũy tiến rất mạnh (`*5` theo crit hiện tại) | Chặn bởi `power_limit.critical` |

### 12.6 Các cap quan trọng đang có trong code

| Chỉ số | Cap hiện tại |
|---|---|
| `tlGiamst` | `<= 60%` (đã cap cứng) |
| Crit | Chưa cap cứng tổng quát (có thể >100) |
| Né đòn | Chưa cap cứng tổng quát |
| HP/MP/Dame/Def âm | Có chặn an toàn ở `setAttributeOverLimit()` |
