# PicBook Firebase 회원 연동 (삼봉월드 공용)

PicBook은 **삼봉월드와 같은 Firebase 프로젝트** `sambong-world-2026` 를 씁니다.  
회원 데이터는 **`picbook_accounts` 컬렉션** 에만 저장합니다 (학생·월드 데이터와 분리).

**삼봉월드 마스터 탭** → 「PicBook 회원」에서 목록·비밀번호 변경·삭제가 가능합니다.

## 1. Firebase 프로젝트

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 선택 또는 생성
2. **Firestore Database** 생성 (테스트 모드로 시작 가능)
3. **프로젝트 설정 → 일반 → 내 앱** 에서 웹 앱 추가 후 설정값 복사

## 2. Firestore 규칙

`firestore.rules` 내용을 콘솔에 붙여넣거나 CLI로 배포합니다.

```bash
firebase deploy --only firestore:rules
```

## 3. PicBook 빌드 환경 변수

**방법 A — JSON 한 줄 (권장)**

GitHub Secrets: `VITE_FIREBASE_CONFIG`

```json
{"apiKey":"...","authDomain":"xxx.firebaseapp.com","projectId":"xxx","appId":"1:...:web:...","storageBucket":"xxx.appspot.com"}
```

**방법 B — 개별 변수**

| 변수 | 설명 |
|------|------|
| `VITE_FIREBASE_API_KEY` | API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | authDomain |
| `VITE_FIREBASE_PROJECT_ID` | projectId |
| `VITE_FIREBASE_APP_ID` | appId |

로컬: `.env.local` 에 위 값 설정 후 `npm run dev`

## 4. 저장되는 데이터 (`picbook_accounts/{이름키}`)

| 필드 | 설명 |
|------|------|
| `name` | 표시 이름 |
| `passwordHash` | 비밀번호 SHA-256 (평문 미저장) |
| `unlockedIds` | 구매·등록한 PicBook ID |
| `timelines` | 마스터 타임라인 연출 |
| `sceneEditsByBook` | 패널 연출 |
| `createdAt` / `updatedAt` | ISO 시간 |

## 5. 동작

- **가입**: Firestore에 PicBook 계정 문서 생성
- **로그인**: Firestore에서 불러와 로컬과 병합
- **구매·연출 변경**: 2초 후 자동으로 Firestore에 저장

Firebase 미설정 시: 이 기기 `localStorage`만 사용 (선택적으로 Cloudflare Worker URL 사용 가능).
