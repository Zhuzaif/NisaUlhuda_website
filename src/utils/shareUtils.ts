import type { DailyAyat } from '../types/ayat';

/**
 * Generates the official Pinterest Pin creation URL with rich metadata:
 * - App download destination URL
 * - Absolute HD image media link
 * - Arabic calligraphy text, Urdu translation, App info, and SEO hashtags
 */
export function getPinterestShareUrl(ayat: DailyAyat): string {
  // Official Google Play Store download link for Nisa Ul Huda app
  const destinationUrl = 'https://play.google.com/store/apps/details?id=com.nisaulhuda.hudalabs';

  // Ensure absolute URL for Pinterest crawler
  const cleanPath = ayat.imageUrl.replace(/^\//, '');
  const mediaUrl = ayat.imageUrl.startsWith('http')
    ? ayat.imageUrl
    : `https://nisa.hudalabs.app/${cleanPath}`;

  const tags = ayat.tags && ayat.tags.length > 0
    ? ayat.tags.map(t => `#${t.replace(/\s+/g, '')}`).join(' ')
    : '#quran #islamicquotes #dailyayat #nisaulhuda #islamiccalligraphy #urduquran';

  const description = `Surah ${ayat.surahName} [Ayat ${ayat.ayatNumber}] - Quranic Calligraphy Poster\n\n${ayat.arabicText}\n\n"${ayat.urduTranslation}"\n\n📲 Download Nisa Ul Huda on Google Play Store (100% Free & Ad-Free Islamic Companion for Women):\nhttps://play.google.com/store/apps/details?id=com.nisaulhuda.hudalabs\n\n🕊️ Read more verses & posters:\nhttps://nisa.hudalabs.app/daily-ayat\n\n${tags}`;

  return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(destinationUrl)}&media=${encodeURIComponent(mediaUrl)}&description=${encodeURIComponent(description)}`;
}

export function openPinterestShare(ayat: DailyAyat): void {
  const url = getPinterestShareUrl(ayat);
  window.open(url, '_blank', 'noopener,noreferrer,width=750,height=600');
}
