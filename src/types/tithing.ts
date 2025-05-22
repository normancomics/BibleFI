
export interface TithingHistoryItem {
  id: string;
  date: Date;
  church: string;
  amount: string;
  token: string;
  method: 'one-time' | 'stream' | 'automatic';
  status: 'completed' | 'processing' | 'failed';
}
