# PicBook (픽북)

그림책을 보며 문장을 따라 읽고 타이핑하는 학습용 웹앱입니다. 첫 고객은 **학교**이며, 수익 모델은 **기본 앱 무료 + 추가팩(이용권) 유료**입니다. 기존 **제품키** 입력은 추가팩 잠금 해제 경로로 계속 유지합니다.

- 배포 주소: https://dmlwjd85.github.io/picbook/ (GitHub Pages)
- 기술 스택: React 19, TypeScript, Vite 6, Tailwind CSS 3, zustand 5, react-router 7, Firebase(Auth·Firestore·Storage)

회원이 되면 책장·마이페이지·랭킹을 쓸 수 있고, 이용권으로 분류별 책을 엽니다. 관리자는 검수 편집창에서 문장과 그림을 고치고, 편집창에는 되돌리기·다시 실행이 있습니다. 로그인하지 않아도 책의 앞부분 몇 문장은 체험할 수 있습니다.

## 실행·빌드·배포

```bash
npm ci            # 의존성 설치 (Node 20 권장)
npm run dev       # 개발 서버 (http://localhost:5173/picbook/) — Firebase 없이 이 기기 체험 모드
npm run lint      # ESLint
npm run build     # prebuild(팩 검증) → tsc -b → vite build → dist/
npm run preview   # 빌드 결과 미리보기
npm run verify:picbooks   # 새 픽북 JSON·그림 검증
npm run test:rules        # Firestore 규칙 테스트
```

- `prebuild`는 `scripts/sync-editor-workspace.mjs`, `scripts/fix-proverb-panels-3x2.mjs`, `scripts/verify-proverbs-pack.mjs`, `scripts/verify-picbooks.mjs`를 자동 실행합니다. 팩 검증에 실패하면 빌드가 멈춥니다.
- **웹앱 배포**: `main`에 푸시하면 `.github/workflows/deploy-pages.yml`이 빌드 후 GitHub Pages로 배포합니다. `vite.config.ts`의 `base`는 `/picbook/`입니다.
- Firebase 프로젝트 준비와 관리자 지정은 `docs/FIREBASE_SETUP.md`, 새 책 대량 제작은 `docs/CONTENT_PIPELINE.md`, 시각 사전은 `docs/VISUAL_DICTIONARY.md`를 참고하세요.

개발 서버(`npm run dev`)는 환경 변수가 없으면 Firebase를 쓰지 않고 이 기기에만 저장합니다. 배포 빌드(`npm run build`)는 환경 변수가 없어도 PicBook 전용 Firebase 프로젝트에 연결됩니다.

## 환경변수 (이름만, 값은 절대 커밋하지 않음)

`.env.example`을 `.env.local`로 복사해 채웁니다. 비워 두면 위 기본 규칙을 따릅니다. 에뮬레이터나 다른 프로젝트를 시험할 때만 채우면 됩니다.

| 이름 | 용도 |
| --- | --- |
| `VITE_FIREBASE_CONFIG` | Firebase 설정 JSON 한 줄 (권장) |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` | `VITE_FIREBASE_CONFIG` 대신 개별 지정 |
| `VITE_FIREBASE_EMULATOR` | `1`이면 로컬 에뮬레이터에 연결 (`npx firebase-tools emulators:start`) |

> `VITE_` 변수는 빌드 결과물(공개 JS)에 그대로 들어갑니다. 진짜 비밀값을 넣지 마세요. Firebase 웹 설정값(apiKey 등)은 공개 값이며, 실제 접근 통제는 `firestore.rules`와 `storage.rules`가 합니다.

## 아키텍처

```
src/
  pages/       화면(홈, 회원가입·로그인, 서재, 플레이, 이용권, 마이페이지, 랭킹,
               관리자 검수 편집창, 마스터 에디터)
  components/  재생 무대, 타이핑 패널, 사이트 헤더, 검수 문장 편집 등 UI
  content/     새 픽북 원고(JSON). 그림은 public/picbooks/
  lib/         엔진 로직(큐 엔진, 타이핑 매칭, 팩 파싱, 이용권, 동기화 …)
  data/        팩 데이터, 카탈로그, 분류, 이용권 상품
  state/       zustand 스토어(대부분 localStorage에 persist)
  types/       공용 타입(pack, timeline, customPicbook, picbookManifest …)
public/        정적 에셋(demo/ 팩 이미지, picbooks/, visual-dictionary/, manifest, sw.js)
scripts/       팩 이미지 처리·검증 스크립트
docs/          Firebase 설정, 콘텐츠 파이프라인, 시각 사전
```

- **엔진**: `src/lib`의 `cueEngine`, `typingMatch`, `typingStats`, `parsePack`, `loadCatalogPack`, `packCache` 등. 팩 데이터와 분리되어 어떤 팩이든 같은 방식으로 재생합니다.
- **책 접근**: `src/lib/bookAccess.ts`와 이용권(`src/lib/passes.ts`, `src/data/passProducts.ts`). 무료 책·보유 이용권·관리자/마스터는 전체, 그 외는 앞부분만 체험합니다.
- **팩**: 기존 `src/data`의 `*Pack.ts`와 카탈로그(`picbookCatalog.ts`)에 더해, 새 책은 `src/content/picbooks/*.json`으로 넣습니다. 마스터가 만든 커스텀 팩과 검수 수정본은 각각 `customPicbookStore`, `bookEditStore`와 Firestore에 저장됩니다.

주요 화면 경로: `/` 홈, `/signup` 회원가입, `/login` 로그인, `/bookshelf` 서재, `/play/:bookId` 연습, `/passes` 이용권, `/mypage` 마이페이지, `/ranking` 랭킹, `/admin` 검수 편집창(관리자), `/editor` 마스터 에디터.

## 팩 추가 절차

새 책은 `docs/CONTENT_PIPELINE.md`를 따릅니다.

1. `src/content/picbooks/{id}.json`에 원고를 작성하고, 그림은 `public/picbooks/{id}/`에 둡니다. 형식은 `src/types/picbookManifest.ts`와 `src/content/picbooks/_example.json`을 참고하세요.
2. 문장마다 그림 4~8장, `id`는 영문 소문자·숫자·하이픈이며 한 번 배포한 id는 바꾸지 않습니다.
3. `npm run verify:picbooks`와 `npm run build`로 검증합니다.
4. 관리자가 `/admin` 검수 편집창에서 확인하고, 필요하면 문장·그림을 고친 뒤 배포합니다. 고친 내용은 원본 파일을 덮지 않고 `picbook_book_edits`에 덧씌웁니다. 편집창에서는 되돌리기·다시 실행을 쓸 수 있습니다.

기존 `src/data/<이름>Pack.ts` + `picbookCatalog.ts` + `packContentVersions.ts` 방식의 팩도 그대로 동작합니다. 팩 본문·연출·이미지를 수정할 때는 `packContentVersions`의 버전을 올려야 이미 받은 사용자에게 최신 내용이 적용됩니다.

## 저장 구조

### localStorage (zustand persist)

| 키 | 스토어 | 내용 |
| --- | --- | --- |
| `picbook.accounts.v2` | `userAccountStore` | 회원 목록(uid, 아이디, 닉네임, 잠금 해제 목록, 세션). 관리자 여부와 이용권은 저장하지 않고 로그인할 때마다 서버에서 읽습니다 |
| `picbook.master.password.v1` | `masterAuthStore` | 마스터 비밀번호 |
| `picbook.editor.pack.v1` | `packEditorStore` | 에디터에서 편집 중인 팩 |
| `picbook.editor.workspace.v1` | `editorWorkspaceStore` | 에디터 작업공간 |
| `picbook.master.timeline.v2` | `picbookTimelineStore` | 마스터 연출 타임라인(책·문장별) |
| `picbook.master.scene-edits.v1` | `picbookSceneEditStore` | 장면 편집 |
| `picbook.custom-books.v1` | `customPicbookStore` | 커스텀 그림책 |
| `picbook.pack-sentence-overrides.v1` | `packSentenceOverrideStore` | 팩 문장 덮어쓰기 |
| `picbook.book-edits.v1` | `bookEditStore` | 검수 편집창에서 고친 문장·그림(아직 배포 전인 수정도 포함) |
| `picbook.typing-records.v1` | `typingRecordStore` | 회원별 최근 타자 기록 |

레거시 키(예전 앱이 쓰던 값, 자동으로 새 키로 옮기지 않음): `picbook.accounts.v1`(이름+6자리 비밀번호 계정), `picbook.user.profile.v1`, `picbook.library.unlocks.v1`.
sessionStorage: 마스터 로그인 여부(탭 단위).

예전 회원(이름 + 숫자 6자리)은 이전 Firebase 프로젝트의 `picbook_accounts`에 남아 있고, 지금 PicBook 전용 프로젝트로 옮겨지지 않습니다. 새로 가입해야 합니다.

### IndexedDB

- DB `picbook-timeline-media`(버전 1), 오브젝트 스토어 `images`, `audio` — 타임라인 커스텀 이미지·오디오(`src/lib/timelineMediaDb.ts`). 키는 `bookId/sentenceId/suffix`.

### 클라우드 (PicBook 전용 Firebase)

- `users/{uid}` 회원 정보·연출 동기화, `users/{uid}/records` 타자 기록, `users/{uid}/passes/{분류}` 이용권
- `admins/{uid}` 관리자 표시(콘솔에서만 생성)
- `picbook_custom_books`, `picbook_book_edits`, `picbook_published_timelines`, `visual_dictionary*` 책 내용
- `rankings/{bookId}/entries` 책별 랭킹, 이용권 코드 컬렉션은 `src/lib/passes.ts`와 `firestore.rules` 참고
- 규칙은 `firestore.rules`, `storage.rules`. `docs/FIREBASE_SETUP.md`에 정리되어 있습니다.

`workers/account-sync`(Cloudflare Worker)는 저장소에 남아 있지만 앱에서는 더 이상 쓰지 않습니다.

### 마이그레이션 원칙

1. **데이터는 절대 잃지 않는다.** 저장 형태를 바꿀 때는 기존 데이터를 읽어 새 형태로 변환하는 `migrate`를 반드시 함께 작성합니다.
2. **localStorage 키 이름을 바꾸지 않는다.** 바꿔야 한다면 옛 키를 읽어 옮긴 뒤에만 정리합니다.
3. persist 스토어는 `version`을 올리고 `migrate(persisted, fromVersion)`에서 이전 버전을 단계별로 변환합니다. 모르는 필드는 버리지 않고 보존합니다.
4. 변환 전 형태의 샘플 데이터로 "그대로 복원된다/올바르게 변환된다" 테스트를 추가합니다.
5. IndexedDB는 `DB_VERSION`을 올리고 `onupgradeneeded`에서 기존 오브젝트 스토어를 지우지 않습니다.
6. 클라우드 문서 구조 변경은 구버전 앱이 읽어도 깨지지 않게(필드 추가 위주) 진행합니다.

## 보안 메모

회원가입·로그인은 Firebase Authentication(이메일/비밀번호)을 씁니다. 배포 환경에서는 비밀번호를 앱 저장소에 남기지 않습니다. Firebase 없이 돌아가는 체험 모드만 이 기기에 비밀번호 해시(SHA-256)를 저장합니다.

마스터 비밀번호와 이용권·제품키 처리는 아직 클라이언트에도 남아 있을 수 있습니다. 해시 처리·서버 검증으로 단계적으로 개선 중입니다. 새 코드에서는 비밀번호 원문을 저장·전송하지 마세요.
