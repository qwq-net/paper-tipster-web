import { db } from './index';
import * as schema from './schema';

async function main() {
  console.log('--- Starting Seeder ---');

  // 1. Create Event
  const [event] = await db
    .insert(schema.events)
    .values({
      name: '第92回日本ダービー開催',
      description: '東京競馬場にて開催される、3歳馬の最高峰のレース。',
      distributeAmount: 10000,
      date: '2025-05-25',
      status: 'SCHEDULED',
    })
    .returning();

  console.log(`Event created: ${event.name}`);

  // 2. Create Race
  const [race] = await db
    .insert(schema.races)
    .values({
      name: '日本ダービー',
      location: '東京競馬場',
      date: '2025-05-25',
      distance: 2400,
      surface: '芝',
      condition: '良',
      status: 'SCHEDULED',
    })
    .returning();

  console.log(`Race created: ${race.name}`);

  // 3. Create Horses & Race Entries
  const horseData = [
    { bracket: 1, name: 'オツルマルボーイ', gender: '牡', age: 6 },
    { bracket: 2, name: 'ミックーロイル', gender: '牡', age: 6 },
    { bracket: 3, name: 'ホクトタナカ', gender: '牝', age: 5 },
    { bracket: 4, name: 'モズバスコット', gender: '牝', age: 4 },
    { bracket: 5, name: 'ラヴズオンリーガミ', gender: '牝', age: 5 },
    { bracket: 6, name: 'ヘニョーヒューズ', gender: '牡', age: 5 },
    { bracket: 7, name: '外 マチカネマチホイザ', gender: '牡', age: 6 },
    { bracket: 8, name: 'モイチャクラ', gender: '牡', age: 3 },
    { bracket: 9, name: 'バードウォッチャー', gender: '牝', age: 8 },
    { bracket: 10, name: '外 フィエールマンタ', gender: '牡', age: 4 },
    { bracket: 11, name: 'シュアイズ', gender: '牡', age: 6 },
    { bracket: 12, name: 'グングニル', gender: '牝', age: 8 },
    { bracket: 13, name: 'カノンチャン', gender: '牡', age: 3 },
    { bracket: 14, name: 'インタネッタ', gender: '牝', age: 6 },
    { bracket: 15, name: 'カグランアレグリア', gender: '牡', age: 6 },
    { bracket: 16, name: 'アローンドカナロア', gender: '牡', age: 5 },
    { bracket: 17, name: 'アータランパクト', gender: '牝', age: 4 },
  ];

  for (const data of horseData) {
    const isForeign = data.name.startsWith('外 ');
    const cleanedName = data.name.replace(/^外 /, '');

    const [horse] = await db
      .insert(schema.horses)
      .values({
        name: cleanedName,
        gender: data.gender,
        age: data.age,
        origin: isForeign ? 'FOREIGN_BRED' : 'DOMESTIC',
      })
      .returning();

    await db.insert(schema.raceEntries).values({
      raceId: race.id,
      horseId: horse.id,
      bracketNumber: data.bracket,
      horseNumber: data.bracket, // 枠番＝馬番と想定
      status: 'ENTRANT',
    });

    console.log(
      `Registered horse: ${horse.name} (${isForeign ? 'Foreign Bred' : 'Domestic'}) as Entry #${data.bracket}`
    );
  }

  console.log('--- Seeder Completed ---');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeder failed:', err);
  process.exit(1);
});
