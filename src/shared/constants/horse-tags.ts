export type HorseTagType = 'LEG_TYPE' | 'CHARACTERISTIC' | 'BIOGRAPHY' | 'OTHER';

export interface HorseTagMaster {
  type: HorseTagType;
  content: string;
}

export const HORSE_TAG_CATEGORIES: Record<HorseTagType, string> = {
  LEG_TYPE: '脚質',
  CHARACTERISTIC: '特性',
  BIOGRAPHY: '来歴',
  OTHER: 'その他',
};

export const HORSE_TAG_MASTER: HorseTagMaster[] = [
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
