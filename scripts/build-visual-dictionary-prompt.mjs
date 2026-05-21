/**
 * 단어 → 사용자 지정 이미지 프롬프트 (엑셀 image_direction 보조)
 * 사용: node scripts/build-visual-dictionary-prompt.mjs 토끼
 */
const STYLE =
  "children's storybook watercolor style, cute and soft, isolated on pure white background, flat lighting, no text"

const subject = process.argv.slice(2).join(' ').trim()
if (!subject) {
  console.error('Usage: node scripts/build-visual-dictionary-prompt.mjs <주제/단어> [추가 연출 설명]')
  process.exit(1)
}

console.log(`${subject}, ${STYLE}`)
