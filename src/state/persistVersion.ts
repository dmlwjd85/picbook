/**
 * zustand persist 공통 버전·마이그레이션 뼈대.
 *
 * - v1 = 이 뼈대를 도입하기 직전(버전 표기 없음 = 0)의 저장 형태 그대로.
 * - 키 이름은 바꾸지 않는다. 기존 데이터는 변환 없이 통과시킨다.
 * - 저장 형태를 바꿀 때는 PERSIST_VERSION을 올리지 말고 스토어별 버전을 올리고
 *   해당 스토어의 migrate에 `if (fromVersion < N) { ...변환 }` 단계를 추가한다.
 */
export const PERSIST_V1 = 1

/** 버전 0(표기 없음) → 1: 형태 변화 없음, 그대로 통과 */
export function migratePassthrough<T>(persisted: unknown, fromVersion: number): T {
  void fromVersion
  return persisted as T
}
