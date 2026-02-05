import { Role } from '@/entities/user';
import { RACE_CONDITIONS } from '@/shared/constants/race';
import { type RaceStatus } from '@/shared/types/race';
import type { HorseGender, HorseTagType, HorseType } from '../types/horse';
import { calculateBracketNumber } from '../utils/bracket';
import { db } from './index';
import * as schema from './schema';

async function main() {
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
    const existing = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, userData.email),
    });

    if (!existing) {
      await db.insert(schema.users).values({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isOnboardingCompleted: true,
      });
      console.log(`User created: ${userData.name} (${userData.role})`);
    }
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

  const venueMap: Record<string, string> = {};

  for (const v of jraRacecourses) {
    const existing = await db.query.venues.findFirst({
      where: (venues, { eq }) => eq(venues.name, v.name),
    });

    if (existing) {
      venueMap[v.name] = existing.id;
    } else {
      const [venue] = await db
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
      console.log(`Racecourse created: ${v.name}`);
    }
  }

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

  const raceDefinitionIds: string[] = [];
  for (const def of g1Definitions) {
    const existing = await db.query.raceDefinitions.findFirst({
      where: (d, { eq }) => eq(d.name, def.name),
    });

    if (existing) {
      raceDefinitionIds.push(existing.id);
    } else {
      const [inserted] = await db
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
      raceDefinitionIds.push(inserted.id);
      console.log(`Race Definition created: ${def.name}`);
    }
  }

  for (const tag of HORSE_TAG_MASTER_DATA) {
    const existing = await db.query.horseTagMaster.findFirst({
      where: (t, { and, eq }) => and(eq(t.type, tag.type), eq(t.content, tag.content)),
    });

    if (!existing) {
      await db.insert(schema.horseTagMaster).values({
        type: tag.type,
        content: tag.content,
      });
      console.log(`Tag created: ${tag.type} - ${tag.content}`);
    }
  }

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

  const allHorses: Array<{ id: string; name: string }> = [];

  for (const horseData of horsePool) {
    const isForeign = horseData.name.startsWith('外 ');
    const cleanedName = horseData.name.replace(/^外 /, '');

    const existing = await db.query.horses.findFirst({
      where: (h, { eq }) => eq(h.name, cleanedName),
    });

    if (existing) {
      allHorses.push(existing);
    } else {
      const [horse] = await db
        .insert(schema.horses)
        .values({
          name: cleanedName,
          gender: horseData.gender,
          age: horseData.age,
          origin: isForeign ? 'FOREIGN_BRED' : 'DOMESTIC',
          type: horseData.type || 'REAL',
        })
        .returning();

      if (horseData.tags && horseData.tags.length > 0) {
        await db.insert(schema.horseTags).values(
          horseData.tags.map((tag) => ({
            horseId: horse.id,
            type: tag.type as HorseTagType,
            content: tag.content,
          }))
        );
      }
      allHorses.push(horse);
      console.log(`Created horse: ${horse.name}`);
    }
  }

  const getRandomCondition = () => RACE_CONDITIONS[Math.floor(Math.random() * RACE_CONDITIONS.length)];

  for (const eventTemplate of eventTemplates) {
    const existingEvent = await db.query.events.findFirst({
      where: (e, { eq }) => eq(e.name, eventTemplate.name),
    });

    let eventId: string;
    if (existingEvent) {
      eventId = existingEvent.id;
    } else {
      const [event] = await db.insert(schema.events).values(eventTemplate).returning();
      console.log(`Event created: ${event.name} (${event.status})`);
      eventId = event.id;
    }

    const selectedDefs = raceDefinitionIds.slice(0, 5);

    for (let i = 0; i < selectedDefs.length; i++) {
      const defId = selectedDefs[i];
      const def = await db.query.raceDefinitions.findFirst({ where: (d, { eq }) => eq(d.id, defId) });
      if (!def) continue;

      const existingInstance = await db.query.raceInstances.findFirst({
        where: (ri, { and, eq }) => and(eq(ri.eventId, eventId), eq(ri.raceDefinitionId, def.id)),
      });

      if (existingInstance) continue;

      const [race] = await db
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
          condition: getRandomCondition(),
          status: (i < 2 ? 'FINALIZED' : i === 2 ? 'CLOSED' : 'SCHEDULED') as RaceStatus,
          type: 'REAL',
        })
        .returning();

      console.log(`Race Instance created: ${race.name}`);

      const shuffledHorses = [...allHorses].sort(() => Math.random() - 0.5);
      const numEntries = Math.min(shuffledHorses.length, 12 + Math.floor(Math.random() * 6));
      const selectedHorses = shuffledHorses.slice(0, numEntries);
      const shuffledNumbers = Array.from({ length: numEntries }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

      for (let j = 0; j < selectedHorses.length; j++) {
        const horse = selectedHorses[j];
        const horseNumber = shuffledNumbers[j];
        const bracketNumber = calculateBracketNumber(horseNumber, numEntries);

        await db.insert(schema.raceEntries).values({
          raceId: race.id,
          horseId: horse.id,
          bracketNumber,
          horseNumber,
          status: 'ENTRANT',
        });
      }
    }
  }

  const deepImpact = await db.query.horses.findFirst({
    where: (h, { eq }) => eq(h.name, 'ディープインパクト'),
  });

  if (deepImpact) {
    const titles = [
      { title: '無敗の三冠馬', date: '2005-10-23' },
      { title: '年度代表馬', date: '2005-01-01' },
      { title: '有馬記念(G1)', date: '2006-12-24' },
      { title: 'ジャパンカップ(G1)', date: '2006-11-26' },
      { title: '天皇賞(春)(G1)', date: '2006-04-30' },
    ];

    for (const t of titles) {
      const existing = await db.query.horseWins.findFirst({
        where: (hw, { and, eq }) => and(eq(hw.horseId, deepImpact.id), eq(hw.title, t.title)),
      });
      if (!existing) {
        await db.insert(schema.horseWins).values({
          horseId: deepImpact.id,
          title: t.title,
          date: t.date,
        });
      }
    }
  }

  const almondEye = await db.query.horses.findFirst({
    where: (h, { eq }) => eq(h.name, 'アーモンドアイ'),
  });

  if (almondEye) {
    const titles = [
      { title: '芝G1 9勝 (史上最多記録)', date: '2020-11-29' },
      { title: '牝馬三冠', date: '2018-10-14' },
      { title: 'ジャパンカップ(G1)', date: '2020-11-29' },
      { title: '天皇賞(秋)(G1)', date: '2020-11-01' },
      { title: 'ドバイターフ(G1)', date: '2019-03-30' },
    ];

    for (const t of titles) {
      const existing = await db.query.horseWins.findFirst({
        where: (hw, { and, eq }) => and(eq(hw.horseId, almondEye.id), eq(hw.title, t.title)),
      });
      if (!existing) {
        await db.insert(schema.horseWins).values({
          horseId: almondEye.id,
          title: t.title,
          date: t.date,
        });
      }
    }
  }

  console.log('--- Seeder Completed Successfully ---');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeder failed:', err);
  process.exit(1);
});
