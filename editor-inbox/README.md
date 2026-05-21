# PicBook 편집 inbox

편집기에서 **public 경로의 그림을 바꿀 때** 여기에 PNG를 넣습니다.

1. 편집기에서 **저장** → `picbook-workspace-{bookId}-*.json` 내려받기
2. JSON의 `pendingAssets[].inboxFile` 이름으로 이 폴더에 파일 복사  
   예: `editor-inbox/elementary-proverbs/public__demo__proverbs__proverbs-cat-bell-03.png`
3. (선택) JSON을 `data/editor-workspace/manifests/{bookId}.json`에 저장
4. `npm run workspace:sync` → `public/`에 반영
5. `npm run build` 또는 GitHub push로 배포

이미지 생성 큐: `data/image-queue/jobs.json` + `npm run queue:images` (assets 폴더에 src 파일만 두면 자동 복사)
