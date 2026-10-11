/**
 * ข้อมูลปลอมสำหรับพัฒนา UI ระหว่างรอต่อ API จริง (RAWG)
 * TODO(เพื่อน): เมื่อต่อ TanStack Query แล้ว ลบโฟลเดอร์ mocks/ ได้
 */
import type { Game, GameDetail, Genre, PriceInfo, Screenshot } from '../types/game'
// รูปเกมตัวอย่าง (ใช้รูปเดียวกันทุกเกมระหว่างรอข้อมูลจริงจาก RAWG)
import gameCover from '../image/apps.808.14492077886571533.be42f4bd-887b-4430-8ed0-622341b4d2b0.jpeg'

export const mockGenres: Genre[] = [
  { id: 4, name: 'Action', slug: 'action' },
  { id: 5, name: 'RPG', slug: 'role-playing-games-rpg' },
  { id: 2, name: 'Shooter', slug: 'shooter' },
  { id: 3, name: 'Adventure', slug: 'adventure' },
  { id: 10, name: 'Strategy', slug: 'strategy' },
  { id: 7, name: 'Puzzle', slug: 'puzzle' },
  { id: 1, name: 'Racing', slug: 'racing' },
  { id: 15, name: 'Sports', slug: 'sports' },
]

const names = [
  'Neon Drift', 'Shadow of Aether', 'Starfall Protocol', 'Iron Bastion', 'Echoes of Eldra',
  'Pixel Kingdom', 'Crimson Horizon', 'Void Runners', 'Mythic Forge', 'Deep Abyss',
  'Skyline Rally', 'Last Outpost', 'Arcane Tactics', 'Frostbound', 'Galactic Siege',
  'Lost Temple', 'Turbo League', 'Cyber Ronin', 'Wild Frontier', 'Quantum Maze',
  'Dragon Covenant', 'Storm Breakers', 'Silent Harbor', 'Titan Arena',
]

export const mockGames: Game[] = names.map((name, i) => ({
  id: i + 1,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  name,
  released: `20${20 + (i % 6)}-0${(i % 9) + 1}-15`,
  background_image: gameCover,
  rating: Math.round((3 + ((i * 7) % 20) / 10) * 10) / 10,
  ratings_count: 800 + i * 137,
  metacritic: i % 5 === 0 ? null : 70 + ((i * 3) % 28),
  added: 90000 - i * 3100,
  playtime: 5 + (i % 40),
  genres: [mockGenres[i % mockGenres.length], mockGenres[(i + 3) % mockGenres.length]],
}))

export function getMockGameDetail(id: number): GameDetail | undefined {
  const game = mockGames.find((g) => g.id === id)
  if (!game) return undefined
  return {
    ...game,
    description_raw:
      `${game.name} พาคุณเข้าสู่โลกที่เต็มไปด้วยการผจญภัยและความท้าทาย ` +
      'สำรวจแผนที่ขนาดใหญ่ ปลดล็อกทักษะใหม่ และต่อสู้กับศัตรูหลากหลายรูปแบบ\n\n' +
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    website: 'https://example.com',
    developers: [{ id: 1, name: 'Sample Studio' }],
    publishers: [{ id: 1, name: 'Sample Publisher' }],
  }
}

export const mockScreenshots: Screenshot[] = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  image: gameCover,
}))

/** ราคาปลอมแบบคงที่ตาม id — TODO(เพื่อน): ถ้าไม่มีข้อมูลราคาจริง ไม่ต้องส่ง price เข้า GameCapsule */
export function getMockPrice(id: number): PriceInfo {
  if (id % 4 === 0) return { type: 'free' }
  const normal = [199, 299, 399, 599, 899, 1290][id % 6]
  const discount = id % 3 === 0 ? [20, 40, 60, 75][id % 4] : 0
  return { type: 'paid', normal, discount }
}
