# 수어·의미 시각 사전 (Visual Dictionary)

PicBook은 타자 **청크(의미 단위)**에 맞춰 PNG 에셋을 레이어처럼 겹쳐 보여 줍니다.

## 협업 워크플로

1. **엑셀 템플릿**  
   `data/visual-dictionary/template/visual_dictionary_template.csv`  
   Excel에서 열어 행을 추가한 뒤 **CSV UTF-8**로 저장합니다.

2. **PNG 제작**  
   - 512×512, 투명 배경(배경 `bg_`만 불투명 가능)  
   - `public/visual-dictionary/{backgrounds|nouns|verbs|...}/` 에 파일명 규칙대로 저장

3. **편집기**  
   마스터 → 편집 → **수어·의미 시각 사전** → 검색 → 배경 / 프레임 / 오버레이 삽입

4. **Firebase** (선택)  
   - 컬렉션 `visual_dictionary` — 항목 메타데이터  
   - 컬렉션 `visual_dictionary_stories` — 작품별 word_id 목록  
   - 실제 파일은 Storage 업로드 후 `image_url` 필드에 URL 기록 (추후 자동화 가능)

## 예시 작품: 토끼와 거북이

- 시드 데이터: `src/data/tortoiseHareVisualDictionary.ts`  
- CSV: `data/visual-dictionary/stories/tortoise_and_hare.csv`  
- 플레이스홀더 생성: `npm run dict:placeholders`

## 재생(Play) 연동

- 팩에 `visualDictionaryStoryId` 또는 `bookId: tortoise-and-hare` 가 있으면 타자에 맞춰 청크 PNG가 레이어로 쌓입니다.
- 예시 팩: **토끼와 거북이** (`/play/tortoise-and-hare`) — 제품키 `PICBOOK-TORTOISE-2026` 또는 마스터 미리보기

## 고도화 제안

- **형태소 분석**: `mecab`/`kiwi` wasm으로 「거북이가」→「거북이」 정규화 (일부 조사는 `visualDictionaryNeedles.ts`에서 처리 중)  
- **Lottie**: 짧은 동작은 JSON, 정지는 PNG  
- **Storage 일괄 업로드**: PNG → `image_url` 자동 매핑 스크립트
