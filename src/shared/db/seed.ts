import { Role } from '@/entities/user';
import { DEFAULT_GUARANTEED_ODDS } from '@/shared/constants/odds';
import { RACE_CONDITIONS } from '@/shared/constants/race';
import { type RaceStatus } from '@/shared/types/race';
import { eq } from 'drizzle-orm';
import type { HorseGender, HorseTagType, HorseType } from '../types/horse';
import { calculateBracketNumber } from '../utils/bracket';
import { db } from './index';
import * as schema from './schema';

const getRandomCondition = () => RACE_CONDITIONS[Math.floor(Math.random() * RACE_CONDITIONS.length)];

function generateDummyWinOdds(entryCount: number): Record<string, number> {
  const odds: Record<string, number> = {};
  for (let i = 1; i <= entryCount; i++) {
    odds[String(i)] = Math.round((1.5 + Math.random() * 30) * 10) / 10;
  }
  return odds;
}

function generateDummyPlaceOdds(entryCount: number): Record<string, { min: number; max: number }> {
  const odds: Record<string, { min: number; max: number }> = {};
  for (let i = 1; i <= entryCount; i++) {
    const min = Math.round((1.1 + Math.random() * 5) * 10) / 10;
    const max = Math.round((min + Math.random() * 3) * 10) / 10;
    odds[String(i)] = { min, max };
  }
  return odds;
}

const usersToCreate = [
  { name: '武豊', role: Role.ADMIN, email: 'admin@example.com' },
  { name: 'ルメール', role: Role.USER, email: 'user@example.com' },
  { name: '川田将雅', role: Role.GUEST, email: 'guest@example.com' },
  { name: '横山武史', role: Role.TIPSTER, email: 'tipster@example.com' },
  { name: '[AI] 戸崎圭太', role: Role.AI_TIPSTER, email: 'ai_tipster@example.com' },
  { name: '[AI] 福永祐一', role: Role.AI_USER, email: 'ai_user@example.com' },
];

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
    name: '第336回 冬記王者決定戦',
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

const jraRacecourses = [
  { code: '01', name: '札幌競馬場', shortName: '札幌', direction: 'RIGHT' as const, area: 'EAST_JAPAN' as const },
  { code: '02', name: '函館競馬場', shortName: '函館', direction: 'RIGHT' as const, area: 'EAST_JAPAN' as const },
  { code: '03', name: '福島競馬場', shortName: '福島', direction: 'RIGHT' as const, area: 'EAST_JAPAN' as const },
  { code: '04', name: '新潟競馬場', shortName: '新潟', direction: 'LEFT' as const, area: 'EAST_JAPAN' as const },
  { code: '05', name: '東京競馬場', shortName: '東京', direction: 'LEFT' as const, area: 'EAST_JAPAN' as const },
  { code: '06', name: '中山競馬場', shortName: '中山', direction: 'RIGHT' as const, area: 'EAST_JAPAN' as const },
  { code: '07', name: '中京競馬場', shortName: '中京', direction: 'LEFT' as const, area: 'WEST_JAPAN' as const },
  { code: '08', name: '京都競馬場', shortName: '京都', direction: 'RIGHT' as const, area: 'WEST_JAPAN' as const },
  { code: '09', name: '阪神競馬場', shortName: '阪神', direction: 'RIGHT' as const, area: 'WEST_JAPAN' as const },
  { code: '10', name: '小倉競馬場', shortName: '小倉', direction: 'RIGHT' as const, area: 'WEST_JAPAN' as const },
];

const HORSE_TAG_MASTER_DATA: Array<{ type: HorseTagType; content: string }> = [
  { type: 'LEG_TYPE', content: '芝' },
  { type: 'LEG_TYPE', content: 'ダート' },
  { type: 'LEG_TYPE', content: '~1200m' },
  { type: 'LEG_TYPE', content: '1200~1600m' },
  { type: 'LEG_TYPE', content: '1200~2000m' },
  { type: 'LEG_TYPE', content: '1600~2000m' },
  { type: 'LEG_TYPE', content: '2000~2400m' },
  { type: 'LEG_TYPE', content: '2000~3000m' },
  { type: 'LEG_TYPE', content: '2400~3200m' },
  { type: 'CHARACTERISTIC', content: '逃げ' },
  { type: 'CHARACTERISTIC', content: '先行' },
  { type: 'CHARACTERISTIC', content: '差し' },
  { type: 'CHARACTERISTIC', content: '追い込み' },
  { type: 'CHARACTERISTIC', content: 'まくり' },
  { type: 'CHARACTERISTIC', content: '冬競馬' },
  { type: 'CHARACTERISTIC', content: '夏競馬' },
  { type: 'CHARACTERISTIC', content: 'ローカル' },
  { type: 'CHARACTERISTIC', content: '大舞台' },
  { type: 'BIOGRAPHY', content: 'G1' },
  { type: 'BIOGRAPHY', content: '重賞' },
  { type: 'BIOGRAPHY', content: '人気薄' },
  { type: 'BIOGRAPHY', content: '人気高' },
];

const g1Definitions = [
  {
    name: 'フェブラリーS',
    grade: 'G1' as const,
    venue: '東京競馬場',
    surface: 'ダート',
    distance: 1600,
    direction: 'LEFT' as const,
  },
  {
    name: '高松宮記念',
    grade: 'G1' as const,
    venue: '中京競馬場',
    surface: '芝',
    distance: 1200,
    direction: 'LEFT' as const,
  },
  {
    name: '大阪杯',
    grade: 'G1' as const,
    venue: '阪神競馬場',
    surface: '芝',
    distance: 2000,
    direction: 'RIGHT' as const,
  },
  {
    name: '桜花賞',
    grade: 'G1' as const,
    venue: '阪神競馬場',
    surface: '芝',
    distance: 1600,
    direction: 'RIGHT' as const,
  },
  {
    name: '皐月賞',
    grade: 'G1' as const,
    venue: '中山競馬場',
    surface: '芝',
    distance: 2000,
    direction: 'RIGHT' as const,
  },
  {
    name: '天皇賞（春）',
    grade: 'G1' as const,
    venue: '京都競馬場',
    surface: '芝',
    distance: 3200,
    direction: 'RIGHT' as const,
  },
  {
    name: 'NHKマイルC',
    grade: 'G1' as const,
    venue: '東京競馬場',
    surface: '芝',
    distance: 1600,
    direction: 'LEFT' as const,
  },
  {
    name: 'ヴィクトリアM',
    grade: 'G1' as const,
    venue: '東京競馬場',
    surface: '芝',
    distance: 1600,
    direction: 'LEFT' as const,
  },
  {
    name: 'オークス',
    grade: 'G1' as const,
    venue: '東京競馬場',
    surface: '芝',
    distance: 2400,
    direction: 'LEFT' as const,
  },
  {
    name: '日本ダービー',
    grade: 'G1' as const,
    venue: '東京競馬場',
    surface: '芝',
    distance: 2400,
    direction: 'LEFT' as const,
  },
  {
    name: '安田記念',
    grade: 'G1' as const,
    venue: '東京競馬場',
    surface: '芝',
    distance: 1600,
    direction: 'LEFT' as const,
  },
  {
    name: '宝塚記念',
    grade: 'G1' as const,
    venue: '阪神競馬場',
    surface: '芝',
    distance: 2200,
    direction: 'RIGHT' as const,
  },
  {
    name: 'スプリンターズS',
    grade: 'G1' as const,
    venue: '中山競馬場',
    surface: '芝',
    distance: 1200,
    direction: 'RIGHT' as const,
  },
  {
    name: '秋華賞',
    grade: 'G1' as const,
    venue: '京都競馬場',
    surface: '芝',
    distance: 2000,
    direction: 'RIGHT' as const,
  },
  {
    name: '菊花賞',
    grade: 'G1' as const,
    venue: '京都競馬場',
    surface: '芝',
    distance: 3000,
    direction: 'RIGHT' as const,
  },
  {
    name: '天皇賞（秋）',
    grade: 'G1' as const,
    venue: '東京競馬場',
    surface: '芝',
    distance: 2000,
    direction: 'LEFT' as const,
  },
  {
    name: 'エリザベス女王杯',
    grade: 'G1' as const,
    venue: '京都競馬場',
    surface: '芝',
    distance: 2200,
    direction: 'RIGHT' as const,
  },
  {
    name: 'マイルCS',
    grade: 'G1' as const,
    venue: '京都競馬場',
    surface: '芝',
    distance: 1600,
    direction: 'RIGHT' as const,
  },
  {
    name: 'ジャパンC',
    grade: 'G1' as const,
    venue: '東京競馬場',
    surface: '芝',
    distance: 2400,
    direction: 'LEFT' as const,
  },
  {
    name: 'チャンピオンズC',
    grade: 'G1' as const,
    venue: '中京競馬場',
    surface: 'ダート',
    distance: 1800,
    direction: 'LEFT' as const,
  },
  {
    name: '阪神JF',
    grade: 'G1' as const,
    venue: '阪神競馬場',
    surface: '芝',
    distance: 1600,
    direction: 'RIGHT' as const,
  },
  {
    name: '朝日杯FS',
    grade: 'G1' as const,
    venue: '阪神競馬場',
    surface: '芝',
    distance: 1600,
    direction: 'RIGHT' as const,
  },
  {
    name: '有馬記念',
    grade: 'G1' as const,
    venue: '中山競馬場',
    surface: '芝',
    distance: 2500,
    direction: 'RIGHT' as const,
  },
  {
    name: 'ホープフルS',
    grade: 'G1' as const,
    venue: '中山競馬場',
    surface: '芝',
    distance: 2000,
    direction: 'RIGHT' as const,
  },
  {
    name: 'アイビスSD',
    grade: 'G3' as const,
    venue: '新潟競馬場',
    surface: '芝',
    distance: 1000,
    direction: 'STRAIGHT' as const,
  },
];

const horsePool: Array<{
  name: string;
  gender: HorseGender;
  age: number | null;
  type?: HorseType;
  tags?: Array<{ type: string; content: string }>;
}> = [
  {
    name: 'オツルマルボーイ',
    gender: '牡',
    age: 6,
    type: 'FICTIONAL',
    tags: [{ type: 'CHARACTERISTIC', content: '逃げ' }],
  },
  {
    name: 'ミックーロイル',
    gender: '牡',
    age: 6,
    type: 'FICTIONAL',
    tags: [{ type: 'CHARACTERISTIC', content: '差し' }],
  },
  {
    name: 'ホクトタナカ',
    gender: '牝',
    age: 5,
    type: 'FICTIONAL',
    tags: [{ type: 'CHARACTERISTIC', content: '先行' }],
  },
  {
    name: 'モズバスコット',
    gender: '牝',
    age: 4,
    type: 'FICTIONAL',
    tags: [
      { type: 'LEG_TYPE', content: '芝' },
      { type: 'LEG_TYPE', content: '1200~1600m' },
    ],
  },
  { name: 'ラヴズオンリーガミ', gender: '牝', age: 5, type: 'FICTIONAL' },
  {
    name: 'ヘニョーヒューズ',
    gender: '牡',
    age: 5,
    type: 'FICTIONAL',
    tags: [{ type: 'LEG_TYPE', content: 'ダート' }],
  },
  {
    name: '外 マチカネマチホイザ',
    gender: '牡',
    age: 6,
    type: 'FICTIONAL',
    tags: [{ type: 'CHARACTERISTIC', content: '差し' }],
  },
  { name: 'モイチャクラ', gender: '牡', age: 3, type: 'FICTIONAL' },
  {
    name: 'セキテイリュウオー',
    gender: '牡',
    age: 5,
    type: 'REAL',
    tags: [{ type: 'CHARACTERISTIC', content: '先行' }],
  },
  { name: 'トウカイテイオー', gender: '牡', age: 4, type: 'REAL', tags: [{ type: 'BIOGRAPHY', content: 'G1' }] },
  { name: 'メジロマックイーン', gender: '牡', age: 5, type: 'REAL', tags: [{ type: 'BIOGRAPHY', content: 'G1' }] },
  { name: 'ライスシャワー', gender: '牡', age: 4, type: 'REAL', tags: [{ type: 'BIOGRAPHY', content: 'G1' }] },
  {
    name: 'ミホノブルボン',
    gender: '牡',
    age: 3,
    type: 'REAL',
    tags: [
      { type: 'BIOGRAPHY', content: 'G1' },
      { type: 'CHARACTERISTIC', content: '逃げ' },
    ],
  },
  {
    name: 'サトノダイヤモンド',
    gender: '牡',
    age: 4,
    type: 'REAL',
    tags: [
      { type: 'BIOGRAPHY', content: 'G1' },
      { type: 'CHARACTERISTIC', content: '先行' },
    ],
  },
  {
    name: 'キタサンブラック',
    gender: '牡',
    age: 5,
    type: 'REAL',
    tags: [
      { type: 'BIOGRAPHY', content: 'G1' },
      { type: 'CHARACTERISTIC', content: '逃げ' },
      { type: 'CHARACTERISTIC', content: '大舞台' },
    ],
  },
  {
    name: 'ゴールドシップ',
    gender: '牡',
    age: 4,
    type: 'REAL',
    tags: [
      { type: 'BIOGRAPHY', content: 'G1' },
      { type: 'CHARACTERISTIC', content: 'まくり' },
    ],
  },
  { name: 'ジェンティルドンナ', gender: '牝', age: 4, type: 'REAL', tags: [{ type: 'BIOGRAPHY', content: 'G1' }] },
  {
    name: 'オルフェーヴル',
    gender: '牡',
    age: 4,
    type: 'REAL',
    tags: [
      { type: 'BIOGRAPHY', content: 'G1' },
      { type: 'CHARACTERISTIC', content: '追い込み' },
    ],
  },
  {
    name: 'ディープインパクト',
    gender: '牡',
    age: 3,
    type: 'REAL',
    tags: [
      { type: 'BIOGRAPHY', content: 'G1' },
      { type: 'CHARACTERISTIC', content: '差し' },
      { type: 'LEG_TYPE', content: '芝' },
    ],
  },
  { name: 'アーモンドアイ', gender: '牝', age: 4, type: 'REAL', tags: [{ type: 'BIOGRAPHY', content: 'G1' }] },
];

const horseWinsData: Record<string, Array<{ title: string; date: string }>> = {
  ディープインパクト: [
    { title: '無敗の三冠馬', date: '2005-10-23' },
    { title: '年度代表馬', date: '2005-01-01' },
    { title: '有馬記念(G1)', date: '2006-12-24' },
    { title: 'ジャパンカップ(G1)', date: '2006-11-26' },
    { title: '天皇賞(春)(G1)', date: '2006-04-30' },
  ],
  アーモンドアイ: [
    { title: '芝G1 9勝 (史上最多記録)', date: '2020-11-29' },
    { title: '牝馬三冠', date: '2018-10-14' },
    { title: 'ジャパンカップ(G1)', date: '2020-11-29' },
    { title: '天皇賞(秋)(G1)', date: '2020-11-01' },
    { title: 'ドバイターフ(G1)', date: '2019-03-30' },
  ],
};

async function main() {
  console.log('--- Starting Seeder ---');

  await db.transaction(async (tx) => {
    let createdUserCount = 0;
    const allUsers: Array<{ id: string; name: string | null; role: string }> = [];

    for (const userData of usersToCreate) {
      const existing = await tx.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, userData.email),
      });

      if (existing) {
        allUsers.push(existing);
      } else {
        const [user] = await tx
          .insert(schema.users)
          .values({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isOnboardingCompleted: true,
          })
          .returning();
        allUsers.push(user);
        createdUserCount++;
        console.log(`User created: ${userData.name} (${userData.role})`);
      }
    }
    if (createdUserCount === 0) console.log('Users: all exist, skipped');

    for (const [key, odds] of Object.entries(DEFAULT_GUARANTEED_ODDS)) {
      const existing = await tx.query.guaranteedOddsMaster.findFirst({
        where: (t, { eq }) => eq(t.key, key),
      });

      if (existing) {
        await tx
          .update(schema.guaranteedOddsMaster)
          .set({ odds: odds.toString() })
          .where(eq(schema.guaranteedOddsMaster.key, key));
      } else {
        await tx.insert(schema.guaranteedOddsMaster).values({
          key,
          odds: odds.toString(),
        });
      }
    }
    console.log('Guaranteed Odds Master seeded');

    const venueMap: Record<string, string> = {};
    let createdVenueCount = 0;

    for (const v of jraRacecourses) {
      const existing = await tx.query.venues.findFirst({
        where: (venues, { eq }) => eq(venues.name, v.name),
      });

      if (existing) {
        venueMap[v.name] = existing.id;
      } else {
        const [venue] = await tx
          .insert(schema.venues)
          .values({
            name: v.name,
            shortName: v.shortName,
            code: v.code,
            defaultDirection: v.direction,
            area: v.area,
          })
          .returning();
        venueMap[v.name] = venue.id;
        createdVenueCount++;
        console.log(`Racecourse created: ${v.name}`);
      }
    }
    if (createdVenueCount === 0) console.log('Venues: all exist, skipped');

    const raceDefinitionMap: Record<string, { id: string; grade: string }> = {};
    let createdDefCount = 0;

    for (const def of g1Definitions) {
      const existing = await tx.query.raceDefinitions.findFirst({
        where: (d, { eq }) => eq(d.name, def.name),
      });

      if (existing) {
        raceDefinitionMap[def.name] = { id: existing.id, grade: existing.grade };
      } else {
        const [inserted] = await tx
          .insert(schema.raceDefinitions)
          .values({
            name: def.name,
            grade: def.grade,
            type: 'REAL',
            defaultDirection: def.direction,
            defaultDistance: def.distance,
            defaultSurface: def.surface,
            defaultVenueId: venueMap[def.venue],
          })
          .returning();
        raceDefinitionMap[def.name] = { id: inserted.id, grade: inserted.grade };
        createdDefCount++;
        console.log(`Race Definition created: ${def.name}`);
      }
    }
    if (createdDefCount === 0) console.log('Race Definitions: all exist, skipped');

    let createdTagCount = 0;
    for (const tag of HORSE_TAG_MASTER_DATA) {
      const existing = await tx.query.horseTagMaster.findFirst({
        where: (t, { and, eq }) => and(eq(t.type, tag.type), eq(t.content, tag.content)),
      });

      if (!existing) {
        await tx.insert(schema.horseTagMaster).values({
          type: tag.type,
          content: tag.content,
        });
        createdTagCount++;
        console.log(`Tag created: ${tag.type} - ${tag.content}`);
      }
    }
    if (createdTagCount === 0) console.log('Horse Tag Master: all exist, skipped');

    const allHorses: Array<{ id: string; name: string }> = [];
    let createdHorseCount = 0;

    for (const horseData of horsePool) {
      const isForeign = horseData.name.startsWith('外 ');
      const cleanedName = horseData.name.replace(/^外 /, '');

      const existing = await tx.query.horses.findFirst({
        where: (h, { eq }) => eq(h.name, cleanedName),
      });

      if (existing) {
        allHorses.push(existing);
      } else {
        const [horse] = await tx
          .insert(schema.horses)
          .values({
            name: cleanedName,
            gender: horseData.gender === '牡' ? 'HORSE' : horseData.gender === '牝' ? 'MARE' : 'GELDING',
            age: horseData.age,
            origin: isForeign ? 'FOREIGN_BRED' : 'DOMESTIC',
            type: horseData.type || 'REAL',
          })
          .returning();

        if (horseData.tags && horseData.tags.length > 0) {
          await tx.insert(schema.horseTags).values(
            horseData.tags.map((tag) => ({
              horseId: horse.id,
              type: tag.type as HorseTagType,
              content: tag.content,
            }))
          );
        }
        allHorses.push(horse);
        createdHorseCount++;
        console.log(`Created horse: ${horse.name}`);
      }
    }
    if (createdHorseCount === 0) console.log('Horses: all exist, skipped');

    const racesPerEvent = 5;
    const raceDefinitionNames = g1Definitions.map((d) => d.name);
    const createdEventIds: Array<{ id: string; status: string; distributeAmount: number }> = [];

    for (let eventIndex = 0; eventIndex < eventTemplates.length; eventIndex++) {
      const eventTemplate = eventTemplates[eventIndex];
      const existingEvent = await tx.query.events.findFirst({
        where: (e, { eq }) => eq(e.name, eventTemplate.name),
      });

      let eventId: string;
      if (existingEvent) {
        eventId = existingEvent.id;
      } else {
        const [event] = await tx.insert(schema.events).values(eventTemplate).returning();
        console.log(`Event created: ${event.name} (${event.status})`);
        eventId = event.id;
      }
      createdEventIds.push({
        id: eventId,
        status: eventTemplate.status,
        distributeAmount: eventTemplate.distributeAmount,
      });

      const startIndex = (eventIndex * racesPerEvent) % raceDefinitionNames.length;
      const selectedDefNames: string[] = [];
      for (let i = 0; i < racesPerEvent; i++) {
        selectedDefNames.push(raceDefinitionNames[(startIndex + i) % raceDefinitionNames.length]);
      }

      for (let i = 0; i < selectedDefNames.length; i++) {
        const defName = selectedDefNames[i];
        const defInfo = raceDefinitionMap[defName];
        if (!defInfo) continue;

        const def = await tx.query.raceDefinitions.findFirst({
          where: (d, { eq }) => eq(d.id, defInfo.id),
        });
        if (!def) continue;

        const existingInstance = await tx.query.raceInstances.findFirst({
          where: (ri, { and, eq }) => and(eq(ri.eventId, eventId), eq(ri.raceDefinitionId, def.id)),
        });

        if (existingInstance) continue;

        const raceStatus = (i < 2 ? 'FINALIZED' : i === 2 ? 'CLOSED' : 'SCHEDULED') as RaceStatus;

        const [race] = await tx
          .insert(schema.raceInstances)
          .values({
            eventId: eventId,
            raceDefinitionId: def.id,
            name: def.name,
            raceNumber: i + 1,
            venueId: def.defaultVenueId,
            date: eventTemplate.date,
            distance: def.defaultDistance,
            surface: def.defaultSurface,
            direction: def.defaultDirection,
            grade: defInfo.grade as typeof def.grade,
            condition: getRandomCondition(),
            status: raceStatus,
            type: 'REAL',
            guaranteedOdds: DEFAULT_GUARANTEED_ODDS,
          })
          .returning();

        console.log(`Race Instance created: ${race.name} (Event: ${eventTemplate.name})`);

        const shuffledHorses = [...allHorses].sort(() => Math.random() - 0.5);
        const numEntries = Math.min(shuffledHorses.length, 12 + Math.floor(Math.random() * 6));
        const selectedHorses = shuffledHorses.slice(0, numEntries);
        const shuffledNumbers = Array.from({ length: numEntries }, (_, idx) => idx + 1).sort(() => Math.random() - 0.5);

        const entryValues = selectedHorses.map((horse, j) => ({
          raceId: race.id,
          horseId: horse.id,
          bracketNumber: calculateBracketNumber(shuffledNumbers[j], numEntries),
          horseNumber: shuffledNumbers[j],
          status: 'ENTRANT' as const,
        }));
        await tx.insert(schema.raceEntries).values(entryValues);
        console.log(`  Entries: ${numEntries} horses registered`);

        const existingOdds = await tx.query.raceOdds.findFirst({
          where: (o, { eq }) => eq(o.raceId, race.id),
        });
        if (!existingOdds) {
          await tx.insert(schema.raceOdds).values({
            raceId: race.id,
            winOdds: generateDummyWinOdds(numEntries),
            placeOdds: generateDummyPlaceOdds(numEntries),
          });
          console.log(`  Odds: win/place odds generated`);
        }

        if (raceStatus === 'FINALIZED') {
          const existingPayout = await tx.query.payoutResults.findFirst({
            where: (p, { eq }) => eq(p.raceId, race.id),
          });
          if (!existingPayout) {
            const sortedEntries = [...entryValues].sort(() => Math.random() - 0.5);
            const top3 = sortedEntries.slice(0, Math.min(3, sortedEntries.length));

            for (let pos = 0; pos < top3.length; pos++) {
              await tx
                .update(schema.raceEntries)
                .set({ finishPosition: pos + 1 })
                .where(eq(schema.raceEntries.horseNumber, top3[pos].horseNumber));
            }

            await tx.insert(schema.payoutResults).values({
              raceId: race.id,
              type: '単勝',
              combinations: {
                horseNumber: top3[0]?.horseNumber,
                odds: Math.round((2 + Math.random() * 20) * 10) / 10,
              },
            });
            console.log(`  Payout: result recorded (winner: No.${top3[0]?.horseNumber})`);
          }
        }
      }
    }

    let walletCount = 0;
    const walletableEvents = createdEventIds.filter((e) => e.status !== 'SCHEDULED');

    for (const eventInfo of walletableEvents) {
      for (const user of allUsers) {
        const existing = await tx.query.wallets.findFirst({
          where: (w, { and, eq }) => and(eq(w.userId, user.id), eq(w.eventId, eventInfo.id)),
        });

        if (!existing) {
          const [wallet] = await tx
            .insert(schema.wallets)
            .values({
              userId: user.id,
              eventId: eventInfo.id,
              balance: eventInfo.distributeAmount,
            })
            .returning();

          await tx.insert(schema.transactions).values({
            walletId: wallet.id,
            type: 'DISTRIBUTION',
            amount: eventInfo.distributeAmount,
            referenceId: eventInfo.id,
          });
          walletCount++;
        }
      }
    }
    if (walletCount > 0) {
      console.log(`Wallets created: ${walletCount} (with DISTRIBUTION transactions)`);
    } else {
      console.log('Wallets: all exist, skipped');
    }

    for (const [horseName, titles] of Object.entries(horseWinsData)) {
      const horse = await tx.query.horses.findFirst({
        where: (h, { eq }) => eq(h.name, horseName),
      });
      if (!horse) continue;

      let winsCreated = 0;
      for (const t of titles) {
        const existing = await tx.query.horseWins.findFirst({
          where: (hw, { and, eq }) => and(eq(hw.horseId, horse.id), eq(hw.title, t.title)),
        });
        if (!existing) {
          await tx.insert(schema.horseWins).values({
            horseId: horse.id,
            title: t.title,
            date: t.date,
          });
          winsCreated++;
        }
      }
      if (winsCreated > 0) {
        console.log(`Horse wins seeded: ${horseName} (${winsCreated} titles)`);
      }
    }
  });

  console.log('--- Seeder Completed Successfully ---');
}

main().catch((err) => {
  console.error('Seeder failed:', err);
  process.exit(1);
});
