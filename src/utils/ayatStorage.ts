import type { DailyAyat } from '../types/ayat';
import { initialAyats } from '../data/defaultAyats';

const STORAGE_KEY = 'nisa_daily_ayats_v1';
const GITHUB_TOKEN_KEY = 'nisa_gh_token';
const GITHUB_REPO = 'Zhuzaif/NisaUlhuda_website';

// Get all ayats (combining localStorage + remote/default)
export async function getAyats(): Promise<DailyAyat[]> {
  let localData: DailyAyat[] = [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      localData = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to read ayats from localStorage', e);
  }

  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/daily-ayats.json?v=${Date.now()}`);
    if (res.ok) {
      const serverData: DailyAyat[] = await res.json();
      // Merge unique by id, prioritizing local additions
      const map = new Map<string, DailyAyat>();
      serverData.forEach(item => map.set(item.id, item));
      localData.forEach(item => map.set(item.id, item));
      return Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  } catch (err) {
    console.warn('Could not fetch remote daily-ayats.json, falling back to local/default', err);
  }

  // Fallback to localData or initialAyats
  if (localData.length > 0) {
    const map = new Map<string, DailyAyat>();
    initialAyats.forEach(item => map.set(item.id, item));
    localData.forEach(item => map.set(item.id, item));
    return Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return initialAyats;
}

// Save to localStorage
export function saveLocalAyat(ayat: DailyAyat) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let list: DailyAyat[] = stored ? JSON.parse(stored) : [...initialAyats];
    // Remove if already exists
    list = list.filter(item => item.id !== ayat.id);
    list.unshift(ayat);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// GitHub Token storage (securely in local browser only)
export function getStoredGitHubToken(): string {
  return localStorage.getItem(GITHUB_TOKEN_KEY) || '';
}

export function setStoredGitHubToken(token: string) {
  localStorage.setItem(GITHUB_TOKEN_KEY, token.trim());
}

// GitHub API: Commit image & update daily-ayats.json
export async function publishToGitHub(
  token: string,
  newAyat: DailyAyat,
  imageBase64: string // Raw base64 string without data:image/... prefix
): Promise<{ success: boolean; message: string }> {
  if (!token) {
    throw new Error('GitHub Personal Access Token is required to commit to repository.');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  const imageExt = newAyat.imageUrl.split('.').pop() || 'jpg';
  const imagePath = `public/posters/${newAyat.id}.${imageExt}`;
  const jsonPath = 'public/data/daily-ayats.json';

  // 1. Upload the poster image
  try {
    // Check if image already exists (to get SHA for update if needed)
    let imageSha: string | undefined;
    const checkImgRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${imagePath}`, { headers });
    if (checkImgRes.ok) {
      const existing = await checkImgRes.json();
      imageSha = existing.sha;
    }

    const uploadImgRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${imagePath}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `feat(poster): upload ${newAyat.id}.${imageExt} [skip ci]`,
        content: imageBase64,
        sha: imageSha,
        branch: 'main'
      })
    });

    if (!uploadImgRes.ok) {
      const errJson = await uploadImgRes.json();
      throw new Error(`Failed to upload image to GitHub: ${errJson.message || uploadImgRes.statusText}`);
    }
  } catch (err: any) {
    throw new Error(`Image upload failed: ${err.message}`);
  }

  // 2. Fetch current daily-ayats.json from GitHub
  try {
    let currentList: DailyAyat[] = [];
    let jsonSha: string | undefined;

    const getJsonRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${jsonPath}`, { headers });
    if (getJsonRes.ok) {
      const jsonContent = await getJsonRes.json();
      jsonSha = jsonContent.sha;
      // Decode content from base64 (handling utf8)
      const decodedStr = decodeURIComponent(
        escape(atob(jsonContent.content.replace(/\s/g, '')))
      );
      currentList = JSON.parse(decodedStr);
    } else {
      currentList = [...initialAyats];
    }

    // Add new ayat at top
    currentList = currentList.filter(item => item.id !== newAyat.id);
    currentList.unshift(newAyat);

    // Encode JSON to base64
    const updatedJsonStr = JSON.stringify(currentList, null, 2);
    const updatedJsonBase64 = btoa(unescape(encodeURIComponent(updatedJsonStr)));

    // Commit updated daily-ayats.json
    const putJsonRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${jsonPath}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `feat(daily-ayat): add ${newAyat.surahName} ${newAyat.ayatNumber}`,
        content: updatedJsonBase64,
        sha: jsonSha,
        branch: 'main'
      })
    });

    if (!putJsonRes.ok) {
      const errJson = await putJsonRes.json();
      throw new Error(`Failed to update daily-ayats.json: ${errJson.message || putJsonRes.statusText}`);
    }

    // Also update local storage
    saveLocalAyat(newAyat);

    return {
      success: true,
      message: `Successfully published to GitHub! GitHub Pages / Actions will deploy in ~30-60 seconds.`
    };
  } catch (err: any) {
    throw new Error(`JSON update failed: ${err.message}`);
  }
}
