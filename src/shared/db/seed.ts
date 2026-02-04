import { Role } from '@/entities/user';
import { RACE_CONDITIONS, RACE_SURFACES, type RaceStatus } from '@/shared/types/race';
import { calculateBracketNumber } from '../utils/bracket';
import { db } from './index';
import * as schema from './schema';

async function main() {
  console.log('--- Starting Seeder ---');

  console.log('--- Starting Seeder ---');

  const usersToCreate = [
    { name: '武豊', role: Role.ADMIN, email: 'admin@example.com' },
    { name: 'ルメール', role: Role.USER, email: 'user@example.com' },
    { name: '川田将雅', role: Role.GUEST, email: 'guest@example.com' },
    { name: '横山武史', role: Role.TIPSTER, email: 'tipster@example.com' },
    { name: '[AI] 戸崎圭太', role: Role.AI_TIPSTER, email: 'ai_tipster@example.com' },
    { name: '[AI] 福永祐一', role: Role.AI_USER, email: 'ai_user@example.com' },
  ];

  for (const userData of usersToCreate) {
    await db.insert(schema.users).values({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      isOnboardingCompleted: true,
    });
    console.log(`User created: ${userData.name} (${userData.role})`);
  }

  const eventTemplates = [
    {
      name: '第334回 拠り所杯',
      description: '第334回 拠り所杯 馬刺しになるのは誰だ！',
      distributeAmount: 100000,
      date: '2026-02-15',
      status: 'SCHEDULED' as const,
    },
    {
      name: '第335回 新春記念',
      description: '新春を祝う伝統の一戦',
      distributeAmount: 150000,
      date: '2026-02-01',
      status: 'ACTIVE' as const,
    },
    {
      name: '第336回 冬季王者決定戦',
      description: '冬の王者を決める熱戦',
      distributeAmount: 200000,
      date: '2026-01-25',
      status: 'COMPLETED' as const,
    },
    {
      name: '第337回 年末グランプリ',
      description: '年末を締めくくる大一番',
      distributeAmount: 180000,
      date: '2025-12-28',
      status: 'COMPLETED' as const,
    },
  ];

  const raceTemplates = [
    { name: '新馬戦', distance: 1600 },
    { name: '未勝利戦', distance: 1800 },
    { name: '500万下', distance: 2000 },
    { name: '1000万下', distance: 2200 },
    { name: 'メインレース', distance: 2400 },
  ];

  const jraRacecourses = [
    '東京競馬場',
    '中山競馬場',
    '京都競馬場',
    '阪神競馬場',
    '中京競馬場',
    '新潟競馬場',
    '福島競馬場',
    '小倉競馬場',
    '札幌競馬場',
    '函館競馬場',
  ];

  const getRandomRacecourse = () => jraRacecourses[Math.floor(Math.random() * jraRacecourses.length)];
  const getRandomSurface = () => RACE_SURFACES[Math.floor(Math.random() * RACE_SURFACES.length)];
  const getRandomCondition = () => RACE_CONDITIONS[Math.floor(Math.random() * RACE_CONDITIONS.length)];

  const horsePool = [
    { name: 'オツルマルボーイ', gender: '牡', age: 6 },
    { name: 'ミックーロイル', gender: '牡', age: 6 },
    { name: 'ホクトタナカ', gender: '牝', age: 5 },
    { name: 'モズバスコット', gender: '牝', age: 4 },
    { name: 'ラヴズオンリーガミ', gender: '牝', age: 5 },
    { name: 'ヘニョーヒューズ', gender: '牡', age: 5 },
    { name: '外 マチカネマチホイザ', gender: '牡', age: 6 },
    { name: 'モイチャクラ', gender: '牡', age: 3 },
    { name: 'バードウォッチャー', gender: '牝', age: 8 },
    { name: '外 フィエールマンタ', gender: '牡', age: 4 },
    { name: 'シュアイズ', gender: '牡', age: 6 },
    { name: 'グングニル', gender: '牝', age: 8 },
    { name: 'カノンチャン', gender: '牡', age: 3 },
    { name: 'インタネッタ', gender: '牝', age: 6 },
    { name: 'カグランアレグリア', gender: '牡', age: 6 },
    { name: 'アローンドカナロア', gender: '牡', age: 5 },
    { name: 'アータランパクト', gender: '牝', age: 4 },
    { name: 'サトノダイヤモンド', gender: '牡', age: 7 },
    { name: 'キタサンブラック', gender: '牡', age: 8 },
    { name: 'ゴールドシップ', gender: '牡', age: 9 },
    { name: 'ジェンティルドンナ', gender: '牝', age: 10 },
    { name: 'オルフェーヴル', gender: '牡', age: 11 },
    { name: 'ディープインパクト', gender: '牡', age: 12 },
    { name: 'ブエナビスタ', gender: '牝', age: 11 },
    { name: 'ウオッカ', gender: '牝', age: 13 },
    { name: 'ダイワスカーレット', gender: '牝', age: 13 },
    { name: 'スティルインラブ', gender: '牝', age: 6 },
    { name: 'コントレイル', gender: '牡', age: 5 },
    { name: 'グランアレグリア', gender: '牝', age: 6 },
    { name: 'クロノジェネシス', gender: '牝', age: 6 },
    { name: 'アーモンドアイ', gender: '牝', age: 7 },
    { name: 'ラッキーライラック', gender: '牝', age: 7 },
    { name: 'リスグラシュー', gender: '牝', age: 8 },
    { name: 'サートゥルナーリア', gender: '牡', age: 6 },
    { name: 'ワグネリアン', gender: '牡', age: 7 },
    { name: 'レイデオロ', gender: '牡', age: 8 },
  ];

  const allHorses: Array<{ id: string; name: string }> = [];

  for (const horseData of horsePool) {
    const isForeign = horseData.name.startsWith('外 ');
    const cleanedName = horseData.name.replace(/^外 /, '');

    const [horse] = await db
      .insert(schema.horses)
      .values({
        name: cleanedName,
        gender: horseData.gender,
        age: horseData.age,
        origin: isForeign ? 'FOREIGN_BRED' : 'DOMESTIC',
      })
      .returning();

    allHorses.push(horse);
    console.log(`Created horse: ${horse.name}`);
  }

  for (const eventTemplate of eventTemplates) {
    const [event] = await db.insert(schema.events).values(eventTemplate).returning();
    console.log(`Event created: ${event.name} (${event.status})`);

    for (let raceIndex = 0; raceIndex < raceTemplates.length; raceIndex++) {
      const raceTemplate = raceTemplates[raceIndex];

      let raceStatus: RaceStatus = 'SCHEDULED';
      let closingAt: Date | null = null;
      let finalizedAt: Date | null = null;

      if (raceIndex === 0) {
        raceStatus = 'FINALIZED';
        closingAt = new Date(Date.now() - 7200000);
        finalizedAt = new Date(Date.now() - 3600000);
      } else if (raceIndex === 1) {
        raceStatus = 'FINALIZED';
        closingAt = new Date(Date.now() - 5400000);
        finalizedAt = new Date(Date.now() - 1800000);
      } else if (raceIndex === 2) {
        raceStatus = 'CLOSED';
        closingAt = new Date(Date.now() - 1800000);
      }

      const [race] = await db
        .insert(schema.races)
        .values({
          eventId: event.id,
          name: raceTemplate.name,
          raceNumber: raceIndex + 1,
          location: getRandomRacecourse(),
          date: event.date,
          distance: raceTemplate.distance,
          surface: getRandomSurface(),
          condition: getRandomCondition(),
          status: raceStatus,
          closingAt,
          finalizedAt,
        })
        .returning();

      console.log(
        `Race created: 第${race.raceNumber}R ${race.name} (${race.status}) - ${race.surface} ${race.condition}`
      );

      const shuffledHorses = [...allHorses].sort(() => Math.random() - 0.5);
      const numEntries = 12 + Math.floor(Math.random() * 6);
      const selectedHorses = shuffledHorses.slice(0, numEntries);

      const shuffledNumbers = Array.from({ length: numEntries }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

      for (let i = 0; i < selectedHorses.length; i++) {
        const horse = selectedHorses[i];
        const horseNumber = shuffledNumbers[i];
        const bracketNumber = calculateBracketNumber(horseNumber, numEntries);

        await db.insert(schema.raceEntries).values({
          raceId: race.id,
          horseId: horse.id,
          bracketNumber,
          horseNumber,
          status: 'ENTRANT',
        });

        console.log(`  Entry: ${horse.name} - 枠${bracketNumber} 馬${horseNumber}`);
      }
    }
  }

  console.log('--- Seeder Completed ---');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeder failed:', err);
  process.exit(1);
});
