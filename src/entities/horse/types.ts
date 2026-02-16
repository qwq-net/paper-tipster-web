import { HORSE_GENDERS, HORSE_ORIGINS, HORSE_TAG_TYPES, HORSE_TYPES } from '@/shared/constants/horse';

export type HorseGender = (typeof HORSE_GENDERS)[number];
export type HorseOrigin = (typeof HORSE_ORIGINS)[number];
export type HorseType = (typeof HORSE_TYPES)[number];
export type HorseTagType = (typeof HORSE_TAG_TYPES)[number];
