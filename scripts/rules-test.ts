// Firestore 규칙 시험 본문 — scripts/run-rules-test.mjs가 에뮬레이터 안에서 실행한다 (npm run test:rules)
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, getDocs, collection, deleteDoc } from 'firebase/firestore'
import { getPicbookAuth, getPicbookFirestore } from '../src/lib/firebase'
import { createCloudUser, fetchCloudUser, pushCloudUser, fetchIsAdmin } from '../src/lib/accountCloudSync'
import { createPassKey, fetchPasses, listPassKeys, redeemPassKey, normalizePassKey } from '../src/lib/passes'
import { saveRecordToCloud, fetchRanking, fetchMyRecords } from '../src/lib/typingRecords'
import { publishBookEdit, fetchAllBookEdits } from '../src/lib/bookEditFirebase'
import { loginIdToEmail } from '../src/lib/accountRules'

let pass = 0, fail = 0
const ok = (name: string, cond: boolean) => {
  if (cond) pass += 1
  else fail += 1
  console.log(cond ? 'PASS' : 'FAIL', name)
}
const denied = async (name: string, p: Promise<unknown>) => {
  try { await p; ok(name + ' (should be denied)', false) } catch (e) { ok(name, (e as { code?: string }).code === 'permission-denied') }
}
const adminRest = (path: string, fields: Record<string, unknown>) =>
  fetch(`http://127.0.0.1:8080/v1/projects/demo-picbook/databases/(default)/documents/${path}`, {
    method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  }).then((r) => { if (!r.ok) throw new Error('rest ' + r.status) })

const auth = getPicbookAuth()!
const db = (await getPicbookFirestore())!
const now = new Date().toISOString()

// --- 회원 A 가입
const a = (await createUserWithEmailAndPassword(auth, loginIdToEmail('alice01'), 'password1')).user
await createCloudUser(a.uid, { loginId: 'alice01', nickname: '앨리스', createdAt: now })
ok('회원 문서 생성·조회', (await fetchCloudUser(a.uid))?.nickname === '앨리스')
ok('서재 동기화 저장', await pushCloudUser(a.uid, { unlockedIds: ['x'], timelines: {}, sceneEditsByBook: {} }))
await denied('아이디 변경 거부', updateDoc(doc(db, 'users', a.uid), { loginId: 'hacker' }))
ok('일반 회원은 관리자 아님', (await fetchIsAdmin(a.uid)) === false)
await denied('이용권 직접 생성 거부', setDoc(doc(db, 'users', a.uid, 'passes', 'proverb'), { category: 'proverb', source: 'key', key: 'NOPE', grantedAt: now }))
await denied('이용권 직접 생성 거부(결제 위장)', setDoc(doc(db, 'users', a.uid, 'passes', 'all'), { category: 'all', source: 'payment', grantedAt: now }))
await denied('관리자 문서 자가 등록 거부', setDoc(doc(db, 'admins', a.uid), { v: 1 }))
ok('일반 회원 코드 발급 실패', (await createPassKey('proverb', 1, '')) === null)
ok('일반 회원 코드 목록 못 봄', (await listPassKeys()).length === 0)
await denied('책 수정본 쓰기 거부', setDoc(doc(db, 'picbook_book_edits', 'elementary-proverbs'), { panels: {}, texts: { 0: 'x' } }))
ok('일반 회원 배포 실패', (await publishBookEdit('elementary-proverbs', { panels: {}, texts: { 0: 'x' }, updatedAt: '' })) === false)

// --- 관리자 B
await signOut(auth)
const b = (await createUserWithEmailAndPassword(auth, loginIdToEmail('teacher1'), 'password1')).user
await createCloudUser(b.uid, { loginId: 'teacher1', nickname: '선생님', createdAt: now })
await adminRest(`admins/${b.uid}`, { v: { integerValue: 1 } })
ok('관리자 확인', await fetchIsAdmin(b.uid))
const key1 = await createPassKey('proverb', 1, '1회용')
const key2 = await createPassKey('all', 2, '학급용')
ok('관리자 코드 발급', Boolean(key1 && key2))
ok('관리자 코드 목록', (await listPassKeys()).length === 2)
ok('관리자 배포', await publishBookEdit('elementary-proverbs', { panels: {}, texts: { 0: '고친 문장' }, reviewed: ['0'], updatedAt: '' }))

// --- 회원 A 코드 등록
await signOut(auth)
await signInWithEmailAndPassword(auth, loginIdToEmail('alice01'), 'password1')
ok('배포본 읽기', (await fetchAllBookEdits())['elementary-proverbs']?.texts[0] === '고친 문장')
ok('없는 코드', (await redeemPassKey(a.uid, 'PB-AAAA-AAAA-AAAA-AAAA')).ok === false)
const r1 = await redeemPassKey(a.uid, key1!)
ok('코드 등록 성공', r1.ok && r1.pass === 'proverb')
ok('이용권 보유 확인', (await fetchPasses(a.uid)).includes('proverb'))
await denied('코드 사용 횟수만 올리기 거부', updateDoc(doc(db, 'pass_keys', normalizePassKey(key2!)), { uses: 1 }))
await denied('코드 분류 바꾸기 거부', updateDoc(doc(db, 'pass_keys', normalizePassKey(key2!)), { category: 'quote' }))
await denied('남의 이용권 읽기 거부', getDocs(collection(db, 'users', b.uid, 'passes')))
await denied('이용권 삭제 거부', deleteDoc(doc(db, 'users', a.uid, 'passes', 'proverb')))

// --- 회원 C: 다 쓴 1회용 코드
await signOut(auth)
const c = (await createUserWithEmailAndPassword(auth, loginIdToEmail('carol01'), 'password1')).user
await createCloudUser(c.uid, { loginId: 'carol01', nickname: '캐럴', createdAt: now })
const r2 = await redeemPassKey(c.uid, key1!)
ok('다 쓴 코드 거절', !r2.ok)
ok('C는 이용권 없음', (await fetchPasses(c.uid)).length === 0)
const r3 = await redeemPassKey(c.uid, key2!)
ok('학급용 코드 등록', r3.ok && r3.pass === 'all')
ok('같은 이용권 재등록 거절', !(await redeemPassKey(c.uid, key2!)).ok)
ok('사용 횟수 1 차감', (await getDoc(doc(db, 'pass_keys', normalizePassKey(key2!)))).data()?.uses === 1)
await denied('남의 회원 문서 읽기 거부', getDoc(doc(db, 'users', a.uid)))

// --- 기록·랭킹
const rec = { bookId: 'elementary-proverbs', bookTitle: '속담', sentence: '가는 말이 고와야 오는 말이 곱다', chars: 17, at: now }
await saveRecordToCloud(c.uid, '캐럴', { ...rec, cpm: 300, accuracy: 95 })
await saveRecordToCloud(c.uid, '캐럴', { ...rec, cpm: 200, accuracy: 99, at: new Date(Date.now() + 1000).toISOString() })
await saveRecordToCloud(c.uid, '캐럴', { ...rec, cpm: 900, accuracy: 50, at: new Date(Date.now() + 2000).toISOString() })
const rank = await fetchRanking('elementary-proverbs')
ok('랭킹: 최고 기록만, 정확도 낮은 기록 제외', rank?.length === 1 && rank[0].bestCpm === 300)
ok('내 기록 3건', (await fetchMyRecords(c.uid))?.length === 3)
await denied('랭킹 조작(낮추기/남의 것) 거부', setDoc(doc(db, 'rankings', 'elementary-proverbs', 'entries', a.uid), { uid: a.uid, nickname: 'x', bestCpm: 999, accuracy: 100, updatedAt: now }))
await denied('랭킹 비정상 타수 거부', setDoc(doc(db, 'rankings', 'elementary-proverbs', 'entries', c.uid), { uid: c.uid, nickname: '캐럴', bestCpm: 99999, accuracy: 100, updatedAt: now }))
await signOut(auth)
ok('비로그인 랭킹 읽기', (await fetchRanking('elementary-proverbs'))?.length === 1)

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
