# Template tính option đồ theo tier

Template này giúp bạn trả lời nhanh câu hỏi:
**"Thêm món đồ mới thì nên để % bao nhiêu cho hợp lý với server?"**

---

## 1) Cách dùng nhanh

- Bước 1: Chọn tier cần thêm đồ (T1-T5).
- Bước 2: Điền chỉ số mục tiêu của player trung bình ở tier đó.
- Bước 3: Chọn mức tăng mong muốn cho món đồ (`ItemImpact%`).
- Bước 4: Chọn loại slot (áo, quần, găng, giày, nhẫn).
- Bước 5: Tính ra option đề xuất theo công thức ở mục 4.
- Bước 6: Test KPI thực chiến, nếu lệch thì giảm/tăng 10-15%.

---

## 2) Bảng baseline theo tier (điền hoặc chỉnh theo server bạn)

| Tier | HP baseline | MP baseline | Dame baseline | Def baseline | Crit baseline | Né baseline |
|---|---:|---:|---:|---:|---:|---:|
| T1 | 180,000 | 140,000 | 24,000 | 2,800 | 16% | 6% |
| T2 | 520,000 | 430,000 | 105,000 | 8,500 | 37% | 15% |
| T3 | 1,200,000 | 900,000 | 220,000 | 16,000 | 45% | 21% |
| T4 | 1,900,000 | 1,400,000 | 320,000 | 24,000 | 55% | 24% |
| T5 | 3,400,000 | 2,700,000 | 620,000 | 39,000 | 72% | 33% |

Ghi chú:
- Đây là baseline tham khảo, bạn có thể thay bằng số thực tế server.

---

## 3) Mức tăng khuyến nghị theo độ hiếm món đồ

| Loại món | `ItemImpact%` đề xuất |
|---|---:|
| Món thường | 4% - 6% |
| Món hiếm | 6% - 9% |
| Món rất hiếm | 9% - 12% |
| Món event giới hạn | 10% - 12% (không nên vượt) |

---

## 4) Công thức template

## 4.1 Chọn tỷ trọng theo slot

### Găng (thiên công)
- `wATK = 0.60`
- `wCRIT = 0.25`
- `wHP = 0.15`

### Áo (thiên thủ)
- `wDEF = 0.45`
- `wHP = 0.40`
- `wNE = 0.15`

### Quần (thiên sinh tồn)
- `wHP = 0.55`
- `wDEF = 0.30`
- `wMP = 0.15`

### Giày (thiên utility)
- `wMP = 0.45`
- `wNE = 0.30`
- `wHP = 0.25`

### Nhẫn (hỗn hợp)
- `wATK = 0.40`
- `wCRIT = 0.30`
- `wHP = 0.20`
- `wNE = 0.10`

## 4.2 Công thức tính theo baseline

Với mỗi chỉ số X:

`DeltaX% = ItemImpact% * wX`

`X_new_target = X_baseline * (1 + DeltaX%/100)`

Nếu muốn set option theo giá trị tuyệt đối:

`OptionX_abs = X_baseline * (DeltaX%/100)`

---

## 5) Form điền mẫu (copy dùng mỗi lần thêm đồ)

```text
[ITEM TEMPLATE INPUT]
Tier: T__
Slot: (Ao/Quan/Gang/Giay/Nhan)
Do hiem: (Thuong/Hiem/Rat hiem/Event)
ItemImpact%: __%

Baseline:
HP = __
MP = __
Dame = __
Def = __
Crit = __%
Ne = __%

Trong so slot:
wATK = __
wHP = __
wDEF = __
wCRIT = __
wNE = __
wMP = __

[ITEM TEMPLATE OUTPUT]
DeltaATK% = ItemImpact% * wATK = __%
DeltaHP%  = ItemImpact% * wHP  = __%
DeltaDEF% = ItemImpact% * wDEF = __%
DeltaCRIT% = ItemImpact% * wCRIT = __%
DeltaNE% = ItemImpact% * wNE = __%
DeltaMP% = ItemImpact% * wMP = __%

Option de xuat:
- ATK% / option 49-50-147: __%
- HP% / option 77: __%
- DEF% / option 94: __%
- CRIT / option 14: +__%
- NE / option 108: +__%
- MP% / option 103: __%
```

---

## 6) Ví dụ tính nhanh

Ví dụ thêm **Găng T4 hiếm**, chọn `ItemImpact = 8%`.

Baseline T4:
- Dame = 320,000
- Crit = 55%
- HP = 1,900,000

Với găng:
- `DeltaATK% = 8% * 0.60 = 4.8%`
- `DeltaCRIT% = 8% * 0.25 = 2.0%`
- `DeltaHP% = 8% * 0.15 = 1.2%`

=> Món găng này nên nằm quanh:
- `% dame`: ~4% đến 6%
- `crit`: +1% đến +3%
- `% HP`: ~1% đến 2%

---

## 7) Trần an toàn bắt buộc (sau khi cộng món mới)

- Crit tổng <= 75%
- Né tổng <= 35%
- Giảm sát thương tổng <= 60%
- Hút HP PVP <= 12%
- Hút HP PVE <= 20%

Nếu vượt trần:
- giảm `ItemImpact%` của món mới 10-20%,
- hoặc giảm trọng số công (wATK, wCRIT).

---

## 8) Checklist test sau khi add item

- [ ] Quái thường cùng tier không chết ổn định dưới 2 hit.
- [ ] Quái tinh anh vẫn trong 6-12 hit.
- [ ] Boss map thường vẫn 45-90 giây solo.
- [ ] PvP cùng tier vẫn 20-60 giây.
- [ ] Không vượt trần crit/né/hút HP.

---

## 9) Mẹo vận hành

- Mỗi patch chỉ buff/nerf tối đa 10-15% hiệu lực món.
- Không buff đồng thời 2 lớp mạnh (ATK% + CRIT%) trong cùng patch.
- Món event nên thiên utility/cosmetic, hạn chế thêm sức mạnh thô.

