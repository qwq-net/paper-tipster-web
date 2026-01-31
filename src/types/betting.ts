export const BET_TYPES = {
  WIN: 'win', // 単勝
  PLACE: 'place', // 複勝
  BRACKET_QUINELLA: 'bracket_quinella', // 枠連
  QUINELLA: 'quinella', // 馬連
  WIDE: 'wide', // ワイド
  EXACTA: 'exacta', // 馬単
  TRIFECTA: 'trifecta', // 三連複
  TRIO: 'trio', // 三連単
} as const;

export type BetType = (typeof BET_TYPES)[keyof typeof BET_TYPES];

export const BET_TYPE_LABELS: Record<BetType, string> = {
  [BET_TYPES.WIN]: '単勝',
  [BET_TYPES.PLACE]: '複勝',
  [BET_TYPES.BRACKET_QUINELLA]: '枠連',
  [BET_TYPES.QUINELLA]: '馬連',
  [BET_TYPES.WIDE]: 'ワイド',
  [BET_TYPES.EXACTA]: '馬単',
  [BET_TYPES.TRIFECTA]: '三連複',
  [BET_TYPES.TRIO]: '三連単',
};

export interface BetDetail {
  type: BetType;
  selections: number[]; // 馬番または枠番。順序が重要な場合は[1着, 2着, 3着]の順
}
