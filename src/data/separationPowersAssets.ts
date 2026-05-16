const base = import.meta.env.BASE_URL
const p = (name: string) => `${base}demo/powers/${name}`

/** 삼권분립 도입·마무리 문장 전용 일러스트 */
export const POWERS_INTRO_IMAGES = {
  title: p('powers-intro-title.png'),
  nation: p('powers-intro-nation.png'),
  assembly: p('powers-intro-assembly.png'),
  executive: p('powers-intro-executive.png'),
  judiciary: p('powers-intro-judiciary.png'),
  divide: p('powers-intro-divide.png'),
  constitution: p('powers-intro-constitution.png'),
  stamp: p('powers-intro-stamp.png'),
} as const

export const POWERS_OUTRO_IMAGES = {
  citizensStatic: p('powers-outro-citizens-static.png'),
  citizensActive: p('powers-outro-citizens-active.png'),
  citizensBarrier: p('powers-outro-citizens-barrier.png'),
} as const
