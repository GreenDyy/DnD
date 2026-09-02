export type IntentType =
  | 'practice_electro'
  | 'practice_listen'
  | 'play_morse'
  | 'ask_morse'
  | 'unknown';

export type CharacterType = 'letter' | 'number' | 'mixed';
export type NumberFormatType = 'short' | 'normal';

export interface ParsedIntent {
  type: IntentType;
  params: Record<string, any>;
  response: string;
  isComplete: boolean;
  missingParams: string[];
}

const REQUIRED_PARAMS: Record<IntentType, string[]> = {
  practice_electro: ['groupCount', 'characterType', 'wpm'],
  practice_listen: [],
  play_morse: ['character'],
  ask_morse: [],
  unknown: [],
};

const OPTIONAL_PARAMS: Record<IntentType, Record<string, any>> = {
  practice_electro: { characterType: 'letter', wpm: 20 },
  practice_listen: { speed: 20 },
  play_morse: {},
  ask_morse: {},
  unknown: {},
};

function generateFollowUpQuestion(intent: ParsedIntent): string {
  const missing = intent.missingParams;
  if (missing.length === 0) return '';

  const p = intent.params;

  if (intent.type === 'practice_electro') {
    const parts: string[] = [];
    if (missing.includes('groupCount')) {
      parts.push('bao nhiêu nhóm');
    }
    if (missing.includes('characterType')) {
      parts.push('chữ cái, chữ số hay hỗn hợp');
    }
    if (missing.includes('wpm')) {
      parts.push('tốc độ bao nhiêu ký tự / 1 phút');
    }
    if (missing.includes('numberFormat')) {
      parts.push('số tắt hay số thường');
    }

    if (parts.length === 1) {
      return `Bạn muốn ${parts[0]}?`;
    }
    return `Bạn muốn ${parts.join(', ')}?`;
  }

  if (intent.type === 'practice_listen') {
    return `Bạn muốn tốc độ nghe bao nhiêu ký tự / 1 phút?`;
  }

  if (intent.type === 'play_morse') {
    return `Bạn muốn phát âm morse của ký tự nào?`;
  }

  return `Bạn muốn cài đặt gì thêm?`;
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
      /(?:tôi\s+)?(?:muốn\s+)?thu(?:\s|$)/i,
    ],
    extractor: (match) => {
      const text = match.input || '';
      const params: Record<string, any> = {};

      // Extract groupCount
      const groupMatch = text.match(/(\d+)\s*(?:nhóm|groups?)/i);
      if (groupMatch) {
        params.groupCount = parseInt(groupMatch[1], 10);
      } else {
        const allNumbers = (text.match(/\d+/g) || []).map(Number);
        if (allNumbers.length >= 1) {
          params.groupCount = allNumbers[0];
        }
      }

      // Extract characterType
      if (/(?:chữ\s*số|number|số)/i.test(text)) {
        params.characterType = 'number' as CharacterType;
      } else if (/(?:hỗn\s*hợp|mixed)/i.test(text)) {
        params.characterType = 'mixed' as CharacterType;
      }

      // Extract wpm
      const wpmMatch = text.match(/(?:tốc\s+độ|speed)\s*(\d+)/i)
        || text.match(/(\d+)\s*(?:wpm|chữ|từ|chars?)?\s*(?:\/?\s*phút|per\s*min)/i)
        || text.match(/(\d+)\s*wpm/i);
      if (wpmMatch) {
        params.wpm = parseInt(wpmMatch[1], 10);
      }

      // Extract numberFormat (chữ số)
      if (/(?:số\s*tắt|số\s*ngắn|short)/i.test(text)) {
        params.numberFormat = 'short';
      } else if (/(?:số\s*thường|số\s*dài|normal)/i.test(text)) {
        params.numberFormat = 'normal';
      }

      return params;
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
      const params: Record<string, any> = {};
      const speed = text.match(/(\d+)\s*(?:wpm|chữ|từ)\s*(?:\/?\s*phút)?/i);
      if (speed) {
        params.speed = parseInt(speed[1], 10);
      }
      return params;
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
      const params: Record<string, any> = {};
      const charMatch = text.match(/(?:morse|mã|play|nghe)\s+(?:cho|của|từ)?\s*["""]?([a-zA-Z0-9.,?]+)["""]?/i);
      if (charMatch) {
        params.character = charMatch[1].toUpperCase();
      }
      return params;
    },
  },
];

function checkComplete(type: IntentType, params: Record<string, any>): { isComplete: boolean; missingParams: string[] } {
  const required = [...(REQUIRED_PARAMS[type] || [])];

  // Conditional required: numberFormat chỉ cần khi characterType === 'number'
  if (type === 'practice_electro' && params.characterType === 'number') {
    if (!required.includes('numberFormat')) {
      required.push('numberFormat');
    }
  }

  const missing = required.filter(p => params[p] === undefined || params[p] === null || params[p] === '');
  return {
    isComplete: missing.length === 0,
    missingParams: missing,
  };
}

function applyDefaults(type: IntentType, params: Record<string, any>): Record<string, any> {
  const defaults = OPTIONAL_PARAMS[type] || {};
  return { ...defaults, ...params };
}

function generateIntentResponse(type: IntentType, params: Record<string, any>): string {
  const characterTypeLabel: Record<CharacterType, string> = {
    letter: 'chữ cái',
    number: 'chữ số',
    mixed: 'hỗn hợp',
  };
  const numberFormatLabel: Record<string, string> = {
    short: 'số tắt',
    normal: 'số thường',
  };

  switch (type) {
    case 'practice_electro': {
      const charLabel = characterTypeLabel[params.characterType] || params.characterType;
      const fmtLabel = params.characterType === 'number' && params.numberFormat
        ? `, ${numberFormatLabel[params.numberFormat] || params.numberFormat}`
        : '';
      return `Được! Mình sẽ mở bảng điện ${params.groupCount} nhóm, ${charLabel}${fmtLabel}, tốc độ ${params.wpm} ký tự / 1 phút. Bắt đầu nhé!`;
    }
    case 'practice_listen':
      return `Ok! Mở chế độ luyện nghe với tốc độ ${params.speed} ký tự / 1 phút. Nghe kỹ và gõ đúng nha!`;
    case 'play_morse':
      return `Mình sẽ phát âm morse của ký tự "${params.character}" ngay!`;
    default:
      return '';
  }
}

export function parseIntent(text: string): ParsedIntent {
  const normalizedText = text.trim().toLowerCase();

  for (const intentDef of INTENT_PATTERNS) {
    for (const pattern of intentDef.patterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        const rawParams = intentDef.extractor(match);
        // Check completeness against RAW params only (no defaults yet)
        const { isComplete, missingParams } = checkComplete(intentDef.type, rawParams);

        // Only apply defaults when complete (user has provided all required)
        const params = isComplete ? applyDefaults(intentDef.type, rawParams) : rawParams;

        return {
          type: intentDef.type,
          params,
          response: isComplete ? generateIntentResponse(intentDef.type, params) : '',
          isComplete,
          missingParams,
        };
      }
    }
  }

  return {
    type: 'ask_morse',
    params: {},
    response: '',
    isComplete: true,
    missingParams: [],
  };
}

export function collectMissingParams(
  intent: ParsedIntent,
  userText: string,
): { params: Record<string, any>; isComplete: boolean; missingParams: string[] } {
  const updatedParams = { ...intent.params };
  const normalizedText = userText.trim().toLowerCase();

  // Check for "mặc định" / "bỏ qua" — use defaults
  if (/(?:mặc\s*định|default|bỏ\s*qua|skip)/i.test(normalizedText)) {
    const defaults = OPTIONAL_PARAMS[intent.type] || {};
    for (const key of intent.missingParams) {
      if (updatedParams[key] === undefined && defaults[key] !== undefined) {
        updatedParams[key] = defaults[key];
      }
    }
  } else {
    // Extract characterType
    if (intent.missingParams.includes('characterType')) {
      if (/(?:chữ\s*số|number|số)/i.test(normalizedText)) {
        updatedParams.characterType = 'number' as CharacterType;
      } else if (/(?:hỗn\s*hợp|mixed)/i.test(normalizedText)) {
        updatedParams.characterType = 'mixed' as CharacterType;
      } else if (/(?:chữ\s*cái|letter)/i.test(normalizedText)) {
        updatedParams.characterType = 'letter' as CharacterType;
      }
    }

    // Extract wpm
    if (intent.missingParams.includes('wpm')) {
      const wpmMatch = normalizedText.match(/(\d+)\s*(?:wpm|chữ|từ)/i)
        || normalizedText.match(/(?:tốc\s+độ|speed)\s*(\d+)/i)
        || normalizedText.match(/^(\d+)$/);
      if (wpmMatch) {
        updatedParams.wpm = parseInt(wpmMatch[1], 10);
      }
    }

    // Extract numberFormat
    if (intent.missingParams.includes('numberFormat')) {
      if (/(?:số\s*tắt|số\s*ngắn|short)/i.test(normalizedText)) {
        updatedParams.numberFormat = 'short';
      } else if (/(?:số\s*thường|số\s*dài|normal)/i.test(normalizedText)) {
        updatedParams.numberFormat = 'normal';
      }
    }

    // Extract speed
    if (intent.missingParams.includes('speed')) {
      const speedMatch = normalizedText.match(/(\d+)\s*(?:wpm|chữ|từ)/i)
        || normalizedText.match(/(?:tốc\s+độ|speed)\s*(\d+)/i)
        || normalizedText.match(/^(\d+)$/);
      if (speedMatch) {
        updatedParams.speed = parseInt(speedMatch[1], 10);
      }
    }

    // Extract groupCount (nếu user bổ sung sau)
    if (intent.missingParams.includes('groupCount')) {
      const groupMatch = normalizedText.match(/(\d+)\s*(?:nhóm|groups?)/i)
        || normalizedText.match(/^(\d+)$/);
      if (groupMatch) {
        updatedParams.groupCount = parseInt(groupMatch[1], 10);
      }
    }

    // Extract character
    if (intent.missingParams.includes('character')) {
      const charMatch = normalizedText.match(/([a-zA-Z0-9.,?]+)/);
      if (charMatch) {
        updatedParams.character = charMatch[1].toUpperCase();
      }
    }
  }

  // Check completeness against current params
  const { isComplete, missingParams } = checkComplete(intent.type, updatedParams);

  // If required params are complete, apply defaults for optional params
  const finalParams = isComplete ? applyDefaults(intent.type, updatedParams) : updatedParams;

  return {
    params: finalParams,
    isComplete,
    missingParams,
  };
}

export function getFollowUpQuestion(intent: ParsedIntent): string {
  return generateFollowUpQuestion(intent);
}

export function getIntentNavigation(type: IntentType, params: Record<string, any>): { screen: string; params?: Record<string, any> } | null {
  switch (type) {
    case 'practice_electro':
      return {
        screen: 'ElectricBoardScreen',
        params: {
          groupCount: params.groupCount,
          characterType: params.characterType,
          numberFormat: params.numberFormat,
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
