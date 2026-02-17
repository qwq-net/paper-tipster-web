export interface RankingData {
  rank: number | string;
  userId: string;
  name: string;
  balance: number | string;
  isCurrentUser: boolean;
  totalLoaned?: number;
}
