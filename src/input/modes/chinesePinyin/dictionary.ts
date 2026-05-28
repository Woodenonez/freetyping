export type PinyinDictionaryEntry = {
  key: string;
  text: string;
  frequency: number;
  phraseLength: number;
  source: 'builtin' | 'rime-pinyin-simp';
};

export type PinyinGeneratedDictionary = {
  source: string;
  license: string;
  generatedAt: string;
  keyCount: number;
  entryCount: number;
  entries: Record<string, [string, number][]>;
};

const singleCharacterEntries = {
  ni: ['你', '尼'],
  hao: ['好', '号', '浩', '豪', '毫', '郝'],
  shi: ['是', '时', '十', '事', '市', '使', '世', '师', '式', '识', '实', '史'],
  de: ['的', '得', '地', '德'],
  wo: ['我', '握', '窝'],
  men: ['们', '门', '闷'],
  ta: ['他', '她', '它', '塔', '踏'],
  zai: ['在', '再', '载'],
  you: ['有', '又', '由', '友', '右', '优'],
  bu: ['不', '部', '步', '布'],
  le: ['了', '乐', '勒'],
  zhong: ['中', '种', '重', '众', '终', '钟'],
  guo: ['国', '过', '果', '郭'],
  ren: ['人', '认', '任', '仁'],
  min: ['民', '敏', '闽'],
  xue: ['学', '雪', '血'],
  sheng: ['生', '声', '省', '胜'],
  xian: ['先', '现', '线', '县'],
  ai: ['爱', '矮', '挨'],
} as const;

const phraseEntries = [
  ['nihao', '你好', 6500],
  ['women', '我们', 6200],
  ['zhongguo', '中国', 6100],
  ['renmin', '人民', 5600],
  ['xuesheng', '学生', 5400],
  ['laoshi', '老师', 5200],
  ['gongzuo', '工作', 5000],
  ['shijie', '世界', 4900],
  ['jintian', '今天', 4700],
  ['mingtian', '明天', 4500],
  ['xianshi', '显示', 4400],
  ['xianshi', '现实', 4300],
  ['xianshi', '限时', 4200],
  ['woai', '我爱', 4000],
] as const;

function createSingleCharacterEntries(): PinyinDictionaryEntry[] {
  return Object.entries(singleCharacterEntries).flatMap(([key, texts]) =>
    texts.map((text, index) => ({
      key,
      text,
      frequency: 3000 - index * 100,
      phraseLength: 1,
      source: 'builtin' as const,
    })),
  );
}

function createPhraseEntries(): PinyinDictionaryEntry[] {
  return phraseEntries.map(([key, text, frequency]) => ({
    key,
    text,
    frequency,
    phraseLength: Array.from(text).length,
    source: 'builtin' as const,
  }));
}

export const pinyinDictionaryEntries: PinyinDictionaryEntry[] = [
  ...createSingleCharacterEntries(),
  ...createPhraseEntries(),
];

export function createEntriesFromGeneratedDictionary(
  dictionary: PinyinGeneratedDictionary,
): PinyinDictionaryEntry[] {
  return Object.entries(dictionary.entries).flatMap(([key, entries]) =>
    entries.map(([text, frequency]) => ({
      key,
      text,
      frequency,
      phraseLength: Array.from(text).length,
      source: 'rime-pinyin-simp' as const,
    })),
  );
}
