# PicBook 전용 Firebase 설정

PicBook은 **자기만의 Firebase 프로젝트**를 씁니다. 예전처럼 삼봉월드 프로젝트(`sambong-world-2026`)를 함께 쓰지 않습니다.
설정값이 없으면 앱은 Firebase 없이 **체험 모드**(계정·편집 내용이 그 기기에만 저장)로 동작합니다.

## 1. 프로젝트 만들기 (한 번만)

1. [Firebase 콘솔](https://console.firebase.google.com/) → **프로젝트 추가** (예: `picbook-app`)
2. **Authentication → 로그인 방법 → 이메일/비밀번호** 사용 설정
   - 회원은 아이디로 가입하지만, 내부적으로 `아이디@picbook.example.com` 꼴의 주소로 저장됩니다. 실제 메일은 보내지 않습니다.
3. **Firestore Database** 만들기 (프로덕션 모드, 위치는 `asia-northeast3` 서울 권장)
4. **Storage** 시작하기 — 편집창에서 올리는 그림이 저장됩니다. (요금제 조건은 콘솔 안내를 확인하세요. Storage를 켜지 않으면 그림은 올린 기기에서만 보입니다.)
5. **프로젝트 설정 → 일반 → 내 앱 → 웹 앱 추가** 후 설정값 복사

## 2. 규칙 배포

```bash
cp .firebaserc.example .firebaserc   # 파일 안의 프로젝트 id를 내 것으로 바꾸기
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,storage
```

규칙 파일: `firestore.rules`, `storage.rules`. 고친 뒤에는 `npm run test:rules`로 시험할 수 있습니다(에뮬레이터, Java 필요).

## 3. 앱에 연결

GitHub 저장소 **Settings → Secrets and variables → Actions**에 `VITE_FIREBASE_CONFIG`를 JSON 한 줄로 넣습니다.

```json
{"apiKey":"...","authDomain":"picbook-app.firebaseapp.com","projectId":"picbook-app","appId":"1:...:web:...","storageBucket":"picbook-app.firebasestorage.app"}
```

로컬 개발은 `.env.local`에 같은 값을 넣고 `npm run dev`.
그리고 **Authentication → 설정 → 승인된 도메인**에 배포 주소(예: `dmlwjd85.github.io`)를 추가합니다.

## 4. 관리자 지정

1. 사이트에서 관리자로 쓸 계정을 회원가입합니다.
2. 콘솔 **Authentication → 사용자**에서 그 계정의 **사용자 UID**를 복사합니다.
3. **Firestore → 컬렉션 시작 → `admins`** → 문서 ID에 UID를 붙여넣고 아무 필드나 하나(예: `role: "admin"`) 넣어 저장합니다.
4. 다시 로그인하면 상단 메뉴에 **편집 · 검수**가 나타납니다.

관리자만 책 배포, 그림 업로드, 이용권 코드 발급을 할 수 있습니다. `admins` 문서는 앱에서 만들 수 없고 콘솔에서만 만듭니다.

## 5. 저장되는 데이터

| 위치 | 내용 | 읽기 | 쓰기 |
|---|---|---|---|
| `users/{uid}` | 아이디, 닉네임, 연출 동기화 | 본인 | 본인 (아이디·가입일 변경 불가) |
| `users/{uid}/records` | 타자 기록 | 본인 | 본인 추가만 |
| `users/{uid}/passes/{분류}` | 이용권 | 본인 | 코드 등록 또는 결제 서버·관리자 |
| `pass_keys/{코드}` | 이용권 코드와 사용 횟수 | 코드를 아는 회원(단건) | 관리자 |
| `rankings/{책}/entries/{uid}` | 책별 최고 타수 | 누구나 | 본인 (더 높은 기록만) |
| `picbook_custom_books`, `picbook_book_edits`, `picbook_published_timelines`, `visual_dictionary*` | 책 내용 | 누구나 | 관리자 |
| `admins/{uid}` | 관리자 표시 | 본인 | 콘솔에서만 |

## 6. 결제 연동 지점

이용권은 `users/{uid}/passes/{분류 id}` 문서가 있느냐로 판단합니다(`all`은 전체 이용권).
카드 결제를 붙일 때는 결제대행사(PG)의 결제 완료 알림을 **서버**(Cloud Functions 등)에서 검증한 뒤, Admin SDK로 이 문서를 만들면 됩니다.
브라우저에서는 이 문서를 직접 만들 수 없습니다 — 이용권 코드 등록(코드 사용 횟수 차감과 한 묶음)만 예외입니다.
가격 표시는 `src/data/passProducts.ts`의 `priceLabel`에서 정합니다.

## 7. 예전 데이터

예전 회원(이름 + 숫자 6자리)은 삼봉월드 프로젝트의 `picbook_accounts`에 남아 있고 새 프로젝트로 옮겨지지 않습니다. 새로 가입해야 합니다.
`workers/account-sync`(Cloudflare Worker 동기화)는 더 이상 앱에서 쓰지 않습니다.
