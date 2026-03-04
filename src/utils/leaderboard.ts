import { supabase } from './supabase';

export interface ScoreEntry {
  name: string;
  score: number;
  created_at?: string;
}

export const getLeaderboard = async (): Promise<ScoreEntry[]> => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('name, score, created_at')
    .order('score', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data || [];
};

export const saveScore = async (name: string, score: number): Promise<ScoreEntry[]> => {
  const { error } = await supabase
    .from('leaderboard')
    .insert([{ name: name.toUpperCase().slice(0, 5), score }]);

  if (error) {
    console.error('Error saving score:', error);
  }

  return getLeaderboard();
};

export const isHighScore = async (score: number): Promise<boolean> => {
  if (score <= 0) return false;
  const leaderboard = await getLeaderboard();
  if (leaderboard.length < 5) return true;
  return score > (leaderboard[leaderboard.length - 1]?.score || 0);
};
