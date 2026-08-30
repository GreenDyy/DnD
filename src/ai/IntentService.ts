export type IntentType =
  | 'practice_electro'
  | 'practice_listen'
  | 'play_morse'
  | 'ask_morse'
  | 'unknown';

export interface ParsedIntent {
  type: IntentType;
  params: Record<string, any>;
  response: string;
}

const INTENT_PATTERNS: { type: IntentType; patterns: RegExp[]; extractor: (match: RegExpMatchArray) => Record<string, any> }[] = [
  {
    type: 'practice_electro',
    patterns: [
      /(?:thu|luyện|truyền)\s+(?:bảng\s+)?(?:điện|điên|mã)\s*(?:với|tốc\s+độ|nhóm|chữ)?/i,
      /(?:bảng\s+điện|morse\s+table)/i,
      /(?:gõ|type|send)\s+(?:bảng|morse)/i,
    ],
    extractor: (match) => {
      const text = match.input || '';
      const groups = text.match(/(\d+)\s*(?:nhóm|groups?)?/i);
      const wpm = text.match(/(\d+)\s*(?:chữ|wpm|từ|chars?)?\s*(?:\/?\s*phút|per\s*min)?/i);
      return {
        groups: groups ? parseInt(groups[1], 10) : 10,
        wpm: wpm ? parseInt(wpm[1], 10) : 20,
      };
    },
  },
  {
    type: 'practice_listen',
    patterns: [
      /(?:nghe|luyện\s+nghe|nghe\s+nhận\s+đạng)/i,
      /(?:listen|hearing)\s*(?:practice|test)?/i,
      /(?:tic\s*tà|tíc\s*tà)/i,
    ],
    extractor: (match) => {
      const text = match.input || '';
      const speed = text.match(/(\d+)\s*(?:wpm|chữ|từ)\s*(?:\/?\s*phút)?/i);
      return {
        speed: speed ? parseInt(speed[1], 10) : 20,
      };
    },
  },
  {
    type: 'play_morse',
    patterns: [
      /(?:phát|nghe|play)\s+(?:morse|mã)\s+(?:cho|của|từ)?\s*["""]?([a-zA-Z0-9.,?]+)["""]?/i,
      /(?:nghe|morse)\s+([a-zA-Z0-9.,?]+)\s*(?:nhé|đi|please)?/i,
    ],
    extractor: (match) => {
      const text = match.input || '';
      const charMatch = text.match(/(?:morse|mã|play|nghe)\s+(?:cho|của|từ)?\s*["""]?([a-zA-Z0-9.,?]+)["""]?/i);
      return {
        character: charMatch ? charMatch[1].toUpperCase() : 'A',
      };
    },
  },
];

export function parseIntent(text: string): ParsedIntent {
  const normalizedText = text.trim().toLowerCase();

  for (const intentDef of INTENT_PATTERNS) {
    for (const pattern of intentDef.patterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        const params = intentDef.extractor(match);
        return {
          type: intentDef.type,
          params,
          response: generateIntentResponse(intentDef.type, params),
        };
      }
    }
  }

  return {
    type: 'ask_morse',
    params: {},
    response: '',
  };
}

function generateIntentResponse(type: IntentType, params: Record<string, any>): string {
  switch (type) {
    case 'practice_electro':
      return `Được! Mình sẽ mở bảng điện với ${params.groups} nhóm, tốc độ ${params.wpm} chữ/phút. Bắt đầu nhé!`;
    case 'practice_listen':
      return `Ok! Mở chế độ luyện nghe với tốc độ ${params.wpm} WPM. Nghe kỹ và gõ đúng nha!`;
    case 'play_morse':
      return `Mình sẽ phát âm morse của ký tự "${params.character}" ngay!`;
    default:
      return '';
  }
}

export function getIntentNavigation(type: IntentType, params: Record<string, any>): { screen: string; params?: Record<string, any> } | null {
  switch (type) {
    case 'practice_electro':
      return { screen: 'ElectroTableScreen', params: { groups: params.groups, wpm: params.wpm } };
    case 'practice_listen':
      return { screen: 'DnDScreen', params: { speed: params.speed } };
    case 'play_morse':
      return null;
    default:
      return null;
  }
}
