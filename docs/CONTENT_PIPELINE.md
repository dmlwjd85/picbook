# 픽북 대량 제작 → 검수 흐름

문장과 그림 4~8장을 넣으면, 타자 진행에 맞춰 그림이 차례로 바뀌는 픽북 문장이 됩니다.
에이전트(또는 사람)가 파일로 대량 제작하고, 관리자가 사이트의 **편집 · 검수** 화면에서 확인·수정합니다.

## 1. 제작: 파일 두 가지만 넣는다

```
src/content/picbooks/{id}.json      ← 책 한 권 (형식: src/types/picbookManifest.ts)
public/picbooks/{id}/s01-1.webp …   ← 그림
```

```json
{
  "id": "proverbs-vol2",
  "title": "초등 속담 2",
  "category": "proverb",
  "free": false,
  "contentVersion": "1",
  "sentences": [
    {
      "text": "티끌 모아 태산",
      "images": [
        "picbooks/proverbs-vol2/s01-1.webp",
        "picbooks/proverbs-vol2/s01-2.webp",
        "picbooks/proverbs-vol2/s01-3.webp",
        "picbooks/proverbs-vol2/s01-4.webp"
      ],
      "closingLine": "작은 것도 모으면 큰 것이 돼요."
    }
  ]
}
```

규칙

- `id`: 영문 소문자·숫자·하이픈. 파일 이름과 같아야 합니다. 한 번 배포한 id는 바꾸지 않습니다(기록·랭킹이 id 기준).
- `category`: `fairy-tale`(동화) · `curriculum`(교과) · `proverb`(속담) · `quote`(명언) · `etc`. 분류를 늘리려면 `src/data/picbookCategories.ts`에 한 줄 추가.
- 교과는 `grade`(1~6)가 필수, `subject`(과목)는 선택.
- `images`: 문장마다 **4~8장**, 등장 순서대로. `public/` 기준 경로 또는 https 주소.
  권장 3:2 비율, 1200×800 이하 WebP, 한 장 200KB 안팎.
- `cueIndexes`는 **비워 두세요.** 문장 길이를 그림 수로 고르게 나누고 낱말이 끊기지 않게 어절 시작에 맞춥니다(`src/lib/autoPanelSentence.ts`). 검수 때 고친 값만 채워집니다.
- `closingLine`: 다 쓴 뒤 보여 줄 뜻·교훈 한 줄(선택).
- 문장 순서를 바꾸거나 중간에 끼워 넣으면 그 뒤 문장의 검수 표시·수정본이 어긋납니다(문장 번호 기준). 추가는 맨 뒤에 하세요.
- 파일 이름이 `_`로 시작하면 싣지 않습니다(`_example.json` 참고).

검사: `npm run verify:picbooks` (빌드 때 자동 실행 — 그림 수, 파일 존재, 분류 등을 확인하고 틀리면 빌드가 멈춥니다)

## 2. 검수: 사이트 → 편집 · 검수 (`/admin`)

관리자 계정으로 로그인하면 상단 메뉴에 나타납니다(관리자 지정: `docs/FIREBASE_SETUP.md` 4번).

1. 왼쪽에서 분류로 걸러 책을 고릅니다. 코드에 들어 있던 기존 책(속담·삼권분립 등)도 같은 목록에 있습니다.
2. **검수 전 문장만 보기**를 켜고 첫 문장의 **편집창 열기**.
3. 편집창에서
   - ① 문장 고치기
   - ② 그림 바꾸기 · 빼기 · 넣기 · 순서 바꾸기 (4~8장)
   - ③ 그림이 바뀌는 위치: 옮길 그림 번호를 고르고 글자를 누르거나, 한 글자씩 앞뒤로 조정. 오른쪽 미리 보기에서 재생해 확인
4. **검수 완료 · 다음 문장 ▶** 을 누르면 저장하고 다음 검수 전 문장이 바로 열립니다.
5. 다 끝나면 책 화면의 **배포하기** — 모든 사용자에게 반영됩니다.

기존 책·파일로 넣은 책은 원본을 건드리지 않고 **고친 문장만 덧씌워** 저장합니다(`picbook_book_edits`). 문장별 **원래대로 되돌리기**가 됩니다.
여러 겹을 겹치는 연출 문장(삼권분립 일부, 시각 사전 방식의 토끼와 거북이)은 여기서 문장만 고치고, 그림 연출은 **세부 연출 편집기**(`/editor`)에서 고칩니다.

## 3. 검수 결과를 파일로 되돌리기 (선택)

책 화면의 **JSON 내려받기**는 검수가 반영된 최신 상태를 같은 형식으로 내려줍니다.
이 파일로 `src/content/picbooks/{id}.json`을 바꾸고 `contentVersion`을 올려 커밋하면 수정본이 원본이 됩니다.
