export const HORSE_GENDERS = ['牡', '牝', 'セン'] as const;
export type HorseGender = (typeof HORSE_GENDERS)[number];

export const HORSE_ORIGINS = ['DOMESTIC', 'FOREIGN_BRED', 'FOREIGN_TRAINED'] as const;
export type HorseOrigin = (typeof HORSE_ORIGINS)[number];
