// Firestore 보안 규칙 시험: 에뮬레이터를 띄우고 실제 앱 코드(src/lib)로 가입·이용권·랭킹 흐름을 돌린다.
// 실행: npm run test:rules   (Java 필요. firebase-tools는 npx가 받아 온다)
import { execFileSync } from 'node:child_process'
import { build } from 'esbuild'

const env = {
  VITE_FIREBASE_CONFIG: JSON.stringify({
    apiKey: 'demo',
    authDomain: 'demo-picbook.firebaseapp.com',
    projectId: 'demo-picbook',
    appId: '1:1:web:1',
  }),
  VITE_FIREBASE_EMULATOR: '1',
}
const define = Object.fromEntries(
  [
    'VITE_FIREBASE_CONFIG',
    'VITE_FIREBASE_EMULATOR',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
  ].map((k) => [`import.meta.env.${k}`, k in env ? JSON.stringify(env[k]) : 'undefined']),
)

await build({
  entryPoints: ['scripts/rules-test.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: 'node_modules/.cache/picbook-rules-test.mjs',
  define,
  logLevel: 'error',
})

execFileSync(
  'npx',
  ['--yes', 'firebase-tools', 'emulators:exec', '--only', 'auth,firestore', '--project', 'demo-picbook',
    'node node_modules/.cache/picbook-rules-test.mjs'],
  { stdio: 'inherit', env: { ...process.env, NO_PROXY: '127.0.0.1,localhost', no_proxy: '127.0.0.1,localhost' } },
)
