# PicBook 계정 동기화 Worker

Cloudflare Workers KV에 계정·구매·타임라인 연출을 저장합니다.

## GitHub Actions로 배포 (권장)

저장소 **Settings → Secrets and variables → Actions** 에 다음을 추가하세요.

| Secret | 설명 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | [API 토큰](https://dash.cloudflare.com/profile/api-tokens) — **Workers KV Storage Edit**, **Workers Scripts Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 대시보드 오른쪽 사이드바 **Account ID** |

추가 후 **Actions → Deploy Account Sync Worker → Run workflow** 를 실행하거나 `main`에 푸시하면 자동 배포됩니다.

배포가 끝나면 `VITE_ACCOUNT_SYNC_URL` 저장소 변수가 Worker 주소로 설정되고 Pages가 다시 빌드됩니다.

## 로컬 배포

```bash
cd workers/account-sync
npm ci
npx wrangler login
npm run kv:create   # 최초 1회 — wrangler.toml 의 id 를 출력값으로 수정
npm run deploy
```

Worker 주소를 PicBook 빌드에 넣습니다.

```bash
# 프로젝트 루트
VITE_ACCOUNT_SYNC_URL=https://picbook-account-sync.<계정>.workers.dev npm run build
```

GitHub Pages: Secrets 에 `VITE_ACCOUNT_SYNC_URL` 또는 Actions 변수로 동일 값 설정.
