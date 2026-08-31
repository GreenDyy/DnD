export type IntentType =
  | 'practice_electro'
  | 'practice_listen'
  | 'play_morse'
  | 'ask_morse'
  | 'unknown';

export type CharacterType = 'letter' | 'number' | 'mixed';

export interface ParsedIntent {
  type: IntentType;
  params: Record<string, any>;
  response: string;
}

const INTENT_PATTERNS: { type: IntentType; patterns: RegExp[]; extractor: (match: RegExpMatchArray) => Record<string, any> }[] = [
  {
    type: 'practice_electro',
    patterns: [
      /(?:thu|luyện|truyền)\s+(?:bảng\s+)?(?:điện|điên|mã|chữ|số)/i,
      /(?:thu|luyện|truyền)\s+\d+\s*(?:nhóm|groups?)/i,
      /(?:thu|luyện|truyền)\s+.*(?:nhóm|tốc\s+độ|wpm)/i,
      /(?:bảng\s+điện|morse\s+table)/i,
      /(?:gõ|type|send)\s+(?:bảng|morse)/i,
    ],
    extractor: (match) => {
      const text = match.input || '';

      // 1. Detect characterType
      let characterType: CharacterType = 'letter';
      if (/(?:chữ\s*số|number|số)/i.test(text)) {
        characterType = 'number';
      } else if (/(?:hỗn\s*hợp|mixed)/i.test(text)) {
        characterType = 'mixed';
      }

      // 2. Extract groupCount: match "X nhóm"
      const groupMatch = text.match(/(\d+)\s*(?:nhóm|groups?)/i);

      // 3. Extract wpm: match "tốc độ X", "X wpm", "X chữ/phút"
      const wpmContextMatch = text.match(/(?:tốc\s+độ|speed)\s*(\d+)/i)
        || text.match(/(\d+)\s*(?:wpm|chữ|từ|chars?)?\s*(?:\/?\s*phút|per\s*min)/i)
        || text.match(/(\d+)\s*wpm/i);

      // 4. Get all numbers from text
      const allNumbers = (text.match(/\d+/g) || []).map(Number);

      // 5. Assign values
      let groupCount: number;
      let wpm: number;

      if (groupMatch && wpmContextMatch) {
        // Both context found
        groupCount = parseInt(groupMatch[1], 10);
        wpm = parseInt(wpmContextMatch[1], 10);
      } else if (groupMatch) {
        // Only groupCount context
        groupCount = parseInt(groupMatch[1], 10);
        wpm = allNumbers.length >= 2 ? allNumbers[1] : 20;
      } else if (wpmContextMatch) {
        // Only wpm context
        wpm = parseInt(wpmContextMatch[1], 10);
        groupCount = allNumbers.length >= 2 ? allNumbers[0] : 10;
      } else if (allNumbers.length === 1) {
        // Single number, assume groupCount
        groupCount = allNumbers[0];
        wpm = 20;
      } else if (allNumbers.length >= 2) {
        // Multiple numbers, first = groupCount, second = wpm
        groupCount = allNumbers[0];
        wpm = allNumbers[1];
      } else {
        // No numbers
        groupCount = 10;
        wpm = 20;
      }

      return { groupCount, wpm, characterType };
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
  const characterTypeLabel: Record<CharacterType, string> = {
    letter: 'chữ cái',
    number: 'chữ số',
    mixed: 'hỗn hợp',
  };

  switch (type) {
    case 'practice_electro':
      return `Được! Mình sẽ mở bảng điện ${params.groupCount} nhóm, ${characterTypeLabel[params.characterType]}, tốc độ ${params.wpm} WPM. Bắt đầu nhé!`;
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
      return {
        screen: 'ElectricBoardScreen',
        params: {
          groupCount: params.groupCount,
          characterType: params.characterType,
          wpm: params.wpm,
        },
      };
    case 'practice_listen':
      return { screen: 'DnDScreen', params: { speed: params.speed } };
    case 'play_morse':
      return null;
    default:
      return null;
  }
}
