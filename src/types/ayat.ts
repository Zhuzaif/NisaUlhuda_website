export interface DailyAyat {
  id: string;
  date: string; // YYYY-MM-DD
  surahName: string;
  surahNumber: number;
  ayatNumber: string | number;
  arabicText: string;
  urduTranslation: string;
  englishTranslation?: string;
  imageUrl: string;
  altText: string;
  theme?: string; // Predefined or custom category; optional if uncategorized
  tags: string[];
}
