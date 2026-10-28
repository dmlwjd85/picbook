# PicBook (픽북)

그림책을 보며 문장을 따라 읽고 타이핑하는 학습용 웹앱입니다. 첫 고객은 **학교**이며, 수익 모델은 **기본 앱 무료 + 추가팩 유료**입니다. 기존 **제품키** 입력은 추가팩 잠금 해제 경로로 계속 유지합니다.

- 배포 주소: https://dmlwjd85.github.io/picbook/ (GitHub Pages)
- 기술 스택: React 19, TypeScript, Vite 6, Tailwind CSS 3, zustand 5, react-router 7, Firebase(Firestore), Cloudflare Worker(선택)

## 실행·빌드·배포

```bash
npm ci            # 의존성 설치 (Node 20 권장)
npm run dev       # 개발 서버 (http://localhost:5173/picbook/)
npm run lint      # ESLint
npm run build     # prebuild(팩 검증 스크립트) → tsc -b → vite build → dist/
npm run preview   # 빌드 결과 미리보기
```

- `prebuild`는 `scripts/sync-editor-workspace.mjs`, `scripts/fix-proverb-panels-3x2.mjs`, `scripts/verify-proverbs-pack.mjs`를 자동 실행합니다. 팩 검증에 실패하면 빌드가 멈춥니다.
- **웹앱 배포**: `main`에 푸시하면 `.github/workflows/deploy-pages.yml`이 빌드 후 GitHub Pages로 배포합니다. `vite.config.ts`의 `base`는 `/picbook/`입니다.
- **계정 동기화 Worker 배포**(선택): `workers/account-sync/**`가 `main`에서 바뀌면 `.github/workflows/deploy-account-sync-worker.yml`이 Cloudflare에 배포합니다. 자세한 내용은 `workers/account-sync/README.md`.
- Firebase 설정은 `docs/FIREBASE_SETUP.md`, 시각 사전은 `docs/VISUAL_DICTIONARY.md`를 참고하세요.

## 환경변수 (이름만, 값은 절대 커밋하지 않음)

`.env.example`을 `.env.local`로 복사해 채웁니다.

| 이름 | 용도 |
| --- | --- |
| `VITE_FIREBASE_CONFIG` | Firebase 설정 JSON 한 줄 (권장) |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` | `VITE_FIREBASE_CONFIG` 대신 개별 지정 |
| `VITE_ACCOUNT_SYNC_URL` | (선택) Firebase 미사용 시 Cloudflare Worker 주소 |

GitHub Actions Secrets(이름만): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` — Worker 배포용.

> `VITE_` 변수는 빌드 결과물(공개 JS)에 그대로 들어갑니다. 진짜 비밀값을 넣지 마세요.

## 아키텍처

```
src/
  pages/       화면(서재, 플레이, 에디터, 로그인, 마스터 설정 …)
  components/  재생 무대, 타이핑 패널, 타임라인 등 UI
  lib/         엔진 로직(큐 엔진, 타이핑 매칭, 팩 파싱·캐시, 동기화, 제품키 …)
  data/        팩 데이터(문장, 에셋 경로, 카탈로그, 팩 콘텐츠 버전)
  state/       zustand 스토어(대부분 localStorage에 persist)
  types/       공용 타입(pack, timeline, customPicbook …)
public/        정적 에셋(demo/ 팩 이미지, visual-dictionary/, manifest, sw.js)
scripts/       팩 이미지 처리·검증·일회성 publish 스크립트
workers/       Cloudflare Worker(account-sync, KV 바인딩 ACCOUNTS)
```

- **엔진**: `src/lib`의 `cueEngine`, `typingMatch`, `typingStats`, `parsePack`, `loadCatalogPack`, `packCache` 등. 팩 데이터와 분리되어 어떤 팩이든 같은 방식으로 재생합니다.
- **팩**: `src/data`의 `*Pack.ts`(예: `elementaryProverbsPack`, `separationThreePowersDemoPack`, `tortoiseHarePack`)가 `ReadingPack`을 만듭니다. `picbookCatalog.ts`가 서점 카탈로그(제목, 표지, 가격, 제품키, 무료 여부)를 정의합니다. 마스터가 만든 커스텀 팩은 `customPicbookStore` + Firestore에 저장됩니다.

## 팩 추가 절차

1. `src/data/<이름>Pack.ts`에 `ReadingPack`을 만드는 함수를 작성합니다(기존 팩과 `scripts/proverb-sentence.TEMPLATE.ts` 참고).
2. 이미지는 `public/demo/<팩>/`에 넣고, 에셋 경로는 `import.meta.env.BASE_URL` 기준으로 씁니다.
3. `src/data/picbookCatalog.ts`에 카탈로그 항목을 추가합니다. 무료 팩은 `free: true`, 유료 추가팩은 `productKey`/`productKeyDisplay`/`listPrice`를 지정합니다.
4. `src/data/packContentVersions.ts`에 bookId와 버전 `'1'`을 추가합니다. **팩 본문·연출·이미지를 수정할 때마다 이 버전을 올려야** 이미 구매한 사용자에게 최신 팩이 적용됩니다.
5. `npm run build`로 검증 스크립트까지 통과하는지 확인합니다.

## 저장 구조

### localStorage (zustand persist)

| 키 | 스토어 | 내용 |
| --- | --- | --- |
| `picbook.accounts.v1` | `userAccountStore` | 학생 계정 목록, 계정별 잠금 해제(구매) 목록, 현재 세션 |
| `picbook.master.password.v1` | `masterAuthStore` | 마스터 비밀번호 |
| `picbook.editor.pack.v1` | `packEditorStore` | 에디터에서 편집 중인 팩 |
| `picbook.editor.workspace.v1` | `editorWorkspaceStore` | 에디터 작업공간 |
| `picbook.master.timeline.v2` | `picbookTimelineStore` | 마스터 연출 타임라인(책·문장별) |
| `picbook.master.scene-edits.v1` | `picbookSceneEditStore` | 장면 편집 |
| `picbook.custom-books.v1` | `customPicbookStore` | 커스텀 그림책 |
| `picbook.pack-sentence-overrides.v1` | `packSentenceOverrideStore` | 팩 문장 덮어쓰기 |

레거시 키(`userAccountStore.migrateLegacyStorage`가 계정으로 옮김): `picbook.user.profile.v1`, `picbook.library.unlocks.v1`.
sessionStorage: 마스터 로그인 여부(탭 단위).

### IndexedDB

- DB `picbook-timeline-media`(버전 1), 오브젝트 스토어 `images`, `audio` — 타임라인 커스텀 이미지·오디오(`src/lib/timelineMediaDb.ts`). 키는 `bookId/sentenceId/suffix`.

### 클라우드

- Firestore 컬렉션: `picbook_accounts`(계정 동기화), `picbook_custom_books`, `picbook_published_timelines`, `visual_dictionary`, `visual_dictionary_stories`. 규칙은 `firestore.rules`.
- Cloudflare Worker `picbook-account-sync`(KV `ACCOUNTS`) — Firebase를 쓰지 않을 때의 계정 동기화 대안.

### 마이그레이션 원칙

1. **데이터는 절대 잃지 않는다.** 저장 형태를 바꿀 때는 기존 데이터를 읽어 새 형태로 변환하는 `migrate`를 반드시 함께 작성합니다.
2. **localStorage 키 이름을 바꾸지 않는다.** 바꿔야 한다면 옛 키를 읽어 옮긴 뒤에만 정리합니다.
3. persist 스토어는 `version`을 올리고 `migrate(persisted, fromVersion)`에서 이전 버전을 단계별로 변환합니다. 모르는 필드는 버리지 않고 보존합니다.
4. 변환 전 형태의 샘플 데이터로 "그대로 복원된다/올바르게 변환된다" 테스트를 추가합니다.
5. IndexedDB는 `DB_VERSION`을 올리고 `onupgradeneeded`에서 기존 오브젝트 스토어를 지우지 않습니다.
6. 클라우드 문서 구조 변경은 구버전 앱이 읽어도 깨지지 않게(필드 추가 위주) 진행합니다.

## 보안 메모

현재 비밀번호와 제품키가 클라이언트에 원문으로 존재합니다. 해시 처리·서버 검증으로 단계적으로 개선 중입니다. 새 코드에서는 비밀번호 원문을 저장·전송하지 마세요.
