import * as fs from 'fs';
import * as path from 'path';

interface PhonemeMapping {
  phoneme: string;
  graphemes: string[];
  description: string;
  commonMistakes: { from: string; to: string }[];
}

const ENGLISH_PHONEME_MAP: PhonemeMapping[] = [
  { phoneme: 'θ', graphemes: ['th'], description: 'Unvoiced th (think)', commonMistakes: [{ from: 's', to: 'θ' }, { from: 'f', to: 'θ' }] },
  { phoneme: 'ð', graphemes: ['th'], description: 'Voiced th (this)', commonMistakes: [{ from: 'd', to: 'ð' }, { from: 'z', to: 'ð' }] },
  { phoneme: 'ŋ', graphemes: ['ng', 'n'], description: 'Nasal ng', commonMistakes: [{ from: 'n', to: 'ŋ' }] },
  { phoneme: 'ʃ', graphemes: ['sh', 'ch', 's'], description: 'Sh sound', commonMistakes: [{ from: 's', to: 'ʃ' }, { from: 'ch', to: 'ʃ' }] },
  { phoneme: 'ʒ', graphemes: ['s', 'g'], description: 'Zh sound (vision)', commonMistakes: [{ from: 's', to: 'ʒ' }] },
  { phoneme: 'tʃ', graphemes: ['ch', 'tch'], description: 'Ch sound', commonMistakes: [{ from: 'sh', to: 'tʃ' }] },
  { phoneme: 'dʒ', graphemes: ['j', 'dg', 'g'], description: 'J sound', commonMistakes: [{ from: 'zh', to: 'dʒ' }] },
  { phoneme: 'w', graphemes: ['w', 'wh'], description: 'W sound', commonMistakes: [{ from: 'v', to: 'w' }] },
  { phoneme: 'r', graphemes: ['r', 'rr'], description: 'R sound', commonMistakes: [{ from: 'l', to: 'r' }, { from: 'w', to: 'r' }] },
  { phoneme: 'l', graphemes: ['l', 'll'], description: 'L sound', commonMistakes: [{ from: 'r', to: 'l' }] },
  { phoneme: 'v', graphemes: ['v', 'f'], description: 'V sound', commonMistakes: [{ from: 'w', to: 'v' }, { from: 'b', to: 'v' }] },
  { phoneme: 'æ', graphemes: ['a'], description: 'Short a (cat)', commonMistakes: [{ from: 'e', to: 'æ' }] },
  { phoneme: 'ʌ', graphemes: ['u', 'o'], description: 'Short u (cup)', commonMistakes: [{ from: 'a', to: 'ʌ' }] },
  { phoneme: 'ə', graphemes: ['a', 'e', 'i', 'o', 'u'], description: 'Schwa (unstressed)', commonMistakes: [] },
  { phoneme: 'ɪ', graphemes: ['i', 'y'], description: 'Short i (sit)', commonMistakes: [{ from: 'i:', to: 'ɪ' }] },
  { phoneme: 'ɛ', graphemes: ['e', 'ea'], description: 'Short e (bed)', commonMistakes: [{ from: 'æ', to: 'ɛ' }] },
  { phoneme: 'ɑ', graphemes: ['a', 'o'], description: 'Open a (father)', commonMistakes: [{ from: 'æ', to: 'ɑ' }] },
  { phoneme: 'ɔ', graphemes: ['aw', 'a', 'ou'], description: 'Open o (dog)', commonMistakes: [{ from: 'a', to: 'ɔ' }] },
  { phoneme: 'ʊ', graphemes: ['oo', 'u'], description: 'Short u (book)', commonMistakes: [{ from: 'u:', to: 'ʊ' }] },
  { phoneme: 'i:', graphemes: ['ee', 'ea', 'e', 'y'], description: 'Long e (see)', commonMistakes: [{ from: 'ɪ', to: 'i:' }] },
  { phoneme: 'u:', graphemes: ['oo', 'ou', 'u'], description: 'Long u (blue)', commonMistakes: [{ from: 'ʊ', to: 'u:' }] },
];

const COMMON_PROBLEM_PAIRS = [
  { phonemes: ['l', 'r'], description: 'L vs R confusion - common for Asian speakers' },
  { phonemes: ['v', 'w'], description: 'V vs W confusion - common for many ESL speakers' },
  { phonemes: ['θ', 's'], description: 'TH vs S confusion - common for many ESL speakers' },
  { phonemes: ['ð', 'd'], description: 'TH vs D confusion - common for many ESL speakers' },
  { phonemes: ['ʃ', 'tʃ'], description: 'SH vs CH confusion' },
  { phonemes: ['b', 'v'], description: 'B vs V confusion - common for Spanish speakers' },
  { phonemes: ['p', 'b'], description: 'P vs B confusion - common for Asian speakers' },
  { phonemes: ['t', 'd'], description: 'T vs D confusion - common for Asian speakers' },
  { phonemes: ['ɪ', 'i:'], description: 'Short I vs Long EE - common confusion' },
  { phonemes: ['ʊ', 'u:'], description: 'Short U vs Long OO - common confusion' },
];

export interface PhonemeMatch {
  phoneme: string;
  expected: string;
  actual: string;
  match: boolean;
  confidence: number;
  description: string;
}

export interface PhonemeAnalysisResult {
  score: number;
  phonemes: PhonemeMatch[];
  problemPhonemes: string[];
  suggestions: string[];
  problemPair?: string;
}

export class PhonemeService {
  private phonemeMap: Map<string, PhonemeMapping> = new Map();

  constructor() {
    for (const p of ENGLISH_PHONEME_MAP) {
      this.phonemeMap.set(p.phoneme, p);
    }
  }

  analyzePhonemes(
    transcribedText: string,
    targetText: string
  ): PhonemeAnalysisResult {
    const normalizedTranscribed = transcribedText.toLowerCase().trim();
    const normalizedTarget = targetText.toLowerCase().trim();

    const targetWords = normalizedTarget.split(/\s+/);
    const transcribedWords = normalizedTranscribed.split(/\s+/);

    const phonemeMatches: PhonemeMatch[] = [];
    const problemPhonemes: Set<string> = new Set();
    const suggestions: string[] = [];

    const maxLen = Math.min(targetWords.length, transcribedWords.length);
    let matchCount = 0;

    for (let i = 0; i < maxLen; i++) {
      const targetWord = targetWords[i];
      const transcribedWord = transcribedWords[i] || '';

      const isMatch = this.wordsMatch(transcribedWord, targetWord);
      if (isMatch) {
        matchCount++;
      }

      const wordProblems = this.findWordProblems(transcribedWord, targetWord);
      for (const prob of wordProblems) {
        problemPhonemes.add(prob.phoneme);
        suggestions.push(prob.suggestion);
      }
    }

    const score = targetWords.length > 0
      ? Math.round((matchCount / maxLen) * 100)
      : 0;

    if (normalizedTranscribed !== normalizedTarget && score < 70) {
      const similar = this.findSimilarity(normalizedTranscribed, normalizedTarget);
      if (similar > 0.5) {
        suggestions.push(`Did you mean "${normalizedTarget}"?`);
      }
    }

    const problemPairs = this.detectProblemPairs(Array.from(problemPhonemes));
    if (problemPairs.length > 0) {
      for (const pair of problemPairs) {
        suggestions.push(pair.description);
      }
    }

    return {
      score,
      phonemes: phonemeMatches,
      problemPhonemes: Array.from(problemPhonemes),
      suggestions: [...new Set(suggestions)].slice(0, 5),
      problemPair: problemPairs[0]?.description,
    };
  }

  private wordsMatch(transcribed: string, target: string): boolean {
    if (transcribed === target) return true;

    const transcribedClean = transcribed.replace(/[^a-z]/g, '');
    const targetClean = target.replace(/[^a-z]/g, '');
    if (transcribedClean === targetClean) return true;

    const distance = this.levenshteinDistance(transcribedClean, targetClean);
    const maxLen = Math.max(transcribedClean.length, targetClean.length);
    return distance <= Math.ceil(maxLen * 0.2);
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  private findWordProblems(transcribed: string, target: string): { phoneme: string; suggestion: string }[] {
    const problems: { phoneme: string; suggestion: string }[] = [];

    const commonErrors: [RegExp, string, string][] = [
      [/v/g, 'v', 'Make sure to use the V sound (upper teeth on lower lip), not W'],
      [/th/g, 'θ', 'The TH sound: place tongue lightly between teeth'],
      [/w/g, 'w', 'W sound: round lips like blowing out a candle'],
      [/l/g, 'l', 'L sound: tongue touches roof of mouth behind teeth'],
      [/r/g, 'r', 'R sound: tongue pulled back, lips slightly rounded'],
    ];

    for (const [regex, phoneme, suggestion] of commonErrors) {
      if (transcribed.match(regex) && target.match(regex)) {
        continue;
      }
      if (transcribed.match(regex) && !target.match(regex)) {
        problems.push({ phoneme, suggestion });
      }
    }

    return problems;
  }

  private findSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    return (longer.length - this.levenshteinDistance(longer, shorter)) / longer.length;
  }

  private detectProblemPairs(phonemes: string[]): { phonemes: string[]; description: string }[] {
    const found: { phonemes: string[]; description: string }[] = [];
    for (const pair of COMMON_PROBLEM_PAIRS) {
      const hasFirst = phonemes.some(p => p.includes(pair.phonemes[0]) || pair.phonemes[0].includes(p));
      const hasSecond = phonemes.some(p => p.includes(pair.phonemes[1]) || pair.phonemes[1].includes(p));
      if (hasFirst && hasSecond) {
        found.push(pair);
      }
    }
    return found;
  }

  getPhonemeDescription(phoneme: string): string {
    const mapping = this.phonemeMap.get(phoneme);
    return mapping?.description || 'Unknown phoneme';
  }

  getCommonMistakes(phoneme: string): string[] {
    const mapping = this.phonemeMap.get(phoneme);
    return mapping?.commonMistakes.map(m => `Instead of "${m.from}", say "${m.to}"`) || [];
  }

  getAllPhonemes(): string[] {
    return Array.from(this.phonemeMap.keys());
  }
}

export const phonemeService = new PhonemeService();
