export const EBBINGHAUS_INTERVALS = [1, 2, 4, 7, 15, 30] as const;
export type EbbinghausInterval = (typeof EBBINGHAUS_INTERVALS)[number];

export const REVIEW_DEFAULT_LIMIT = 3;

export const STORAGE_KEYS = {
  NICKNAME: '@nickname',
  DAY_RECORDS: '@day_records',
  COMPLETIONS: '@completions',
  REVIEW_LIMIT: '@review_limit',
} as const;

export const COLORS = {
  // 背景层级（深度从深到浅）
  background: '#1C2B1A',
  headerBg: '#243322',
  card: '#2A3D27',
  cardHover: '#334D2F',

  // 核心绿色系
  primary: '#7AB56E',
  primaryDark: '#3B6D11',
  progressStart: '#4A7A46',
  progressEnd: '#7AB56E',

  // 语义色
  danger: '#E57373',
  dangerBg: '#2E1F1F',
  warning: '#F0A855',
  warningBg: '#2E2516',

  // 提示
  bannerBg: '#334D2F',
  bannerText: '#A8D5A2',

  // 文字层级
  text: '#E8F5E5',
  textSecondary: '#A8D5A2',
  textTertiary: '#7A9E76',

  // 边框
  border: '#3E5C38',

  // 其他
  overlay: 'rgba(0,0,0,0.6)',
  white: '#FFFFFF',
} as const;
