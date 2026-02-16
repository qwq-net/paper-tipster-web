import {
  RACE_CONDITIONS,
  RACE_GRADES,
  RACE_STATUSES,
  RACE_SURFACES,
  RACE_TYPES,
  VENUE_AREAS,
  VENUE_DIRECTIONS,
} from '@/shared/constants/race';

export type RaceSurface = (typeof RACE_SURFACES)[number];
export type RaceCondition = (typeof RACE_CONDITIONS)[number];
export type RaceStatus = (typeof RACE_STATUSES)[number];
export type RaceType = (typeof RACE_TYPES)[number];
export type RaceGrade = (typeof RACE_GRADES)[number];
export type VenueDirection = (typeof VENUE_DIRECTIONS)[number];
export type VenueArea = (typeof VENUE_AREAS)[number];

export interface Venue {
  id: string;
  name: string;
  shortName: string;
  code: string | null;
  defaultDirection: VenueDirection;
  area: VenueArea;
}

export interface RaceDefinition {
  id: string;
  name: string;
  code: string | null;
  grade: RaceGrade;
  type: RaceType;
  defaultDirection: VenueDirection;
  defaultDistance: number;
  defaultVenueId: string;
  defaultSurface: string;
}
