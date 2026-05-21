# 수어·의미 시각 사전 에셋

- **규격**: 512×512 PNG, 투명 배경(배경 레이어 `bg_` 제외)
- **파일명**:
  - `bg_` 배경 · `n_` 명사 · `v_` 동사 · `a_` 형용사 · `e_` 감정 · `fx_` 이펙트 · `p_` 조사/기타

## 폴더

| 폴더 | 용도 |
|------|------|
| `backgrounds/` | 전체 화면 배경 |
| `nouns/` | 캐릭터·사물 |
| `verbs/` | 동작 이펙트 |
| `adjectives/` | 속도·성질 |
| `emotions/` | 감정 파티클 |
| `effects/` | 먼지·반짝 등 |
| `particles/` | 조사·접속 보조 |

## 엑셀(협업)

1. `data/visual-dictionary/template/visual_dictionary_template.csv` 를 Excel에서 열기
2. 행 추가 후 **CSV UTF-8**로 저장
3. PicBook 편집 탭 → 수어 사전 → **CSV 가져오기**

플레이스홀더 생성:

```bash
node scripts/generate-visual-dictionary-placeholders.mjs
```
