import { knowledgeBase } from './knowledgeBase';

class KnowledgeService {
  /**
   * Tìm thông tin về một ký tự Morse.
   */
  findCharacter(character) {
    const normalizedCharacter = character.trim().toUpperCase();
    return knowledgeBase.morseBasic.entries.find(
      item => item.character === normalizedCharacter
    );
  }

  /**
   * Giải mã Morse.
   */
  decodeMorse(code) {
    const normalizedCode = code.trim();
    const parts = normalizedCode.split(/\s+/);

    return parts
      .map(part => {
        const result = knowledgeBase.morseBasic.entries.find(
          item => item.code === part
        );
        return result ? result.character : '?';
      })
      .join('');
  }

  /**
   * Tìm context liên quan từ knowledge base (dùng cho RAG).
   */
  getContext(question) {
    const text = question.trim().toLowerCase();
    const contextParts = [];

    // 1. Trích xuất ký tự Morse cụ thể từ câu hỏi
    const targetChar = this._extractTargetCharacter(text);
    if (targetChar) {
      const entry = knowledgeBase.morseBasic.entries.find(
        item => item.character.toLowerCase() === targetChar.toLowerCase()
      );
      if (entry) {
        contextParts.push(
          `Ký tự "${entry.character}" trong Morse là "${entry.code}". ${entry.description}`
        );
      }
    }

    // 2. Tìm rule CHỈ khi câu hỏi trực tiếp hỏi về chủ đề rule
    const matchedRules = this._findRelevantRules(text);
    for (const rule of matchedRules.slice(0, 1)) {
      contextParts.push(`${rule.title}: ${rule.content}`);
    }

    // 3. Nếu không tìm thấy gì, trả về ngắn gọn
    if (contextParts.length === 0) {
      const sample = knowledgeBase.morseBasic.entries
        .slice(0, 8)
        .map(e => `${e.character}=${e.code}`)
        .join(', ');
      contextParts.push(`Morse: ${sample}`);
    }

    return contextParts.join('\n');
  }

  /**
   * Tìm rule liên quan — CHỈ khi câu hỏi hỏi trực tiếp về chủ đề rule.
   */
  _findRelevantRules(text) {
    // Chỉ match rule khi câu hỏi chứa từ khóa CHÍNH xác của rule
    const directKeywords = {
      'tích': ['tích', 'dot'],
      'tà': ['tà', 'dash'],
      'sos': ['sos'],
      'khoảng cách': ['khoảng cách', 'khoảng nghỉ'],
      'tần số': ['tần số', 'frequency', 'hz'],
      'tốc độ': ['tốc độ', 'wpm', 'words per minute'],
      'prosign': ['prosign', 'ký hiệu đặc biệt'],
      'quy tắc': ['quy tắc', 'truyền', 'gửi tin'],
      'lỗi': ['lỗi', 'sai', 'nhầm'],
      'best practice': ['thực hành', 'cải thiện', 'best practice'],
      'ứng dụng': ['ứng dụng', 'hàng hải', 'quân sự'],
    };

    const matched = [];
    for (const rule of knowledgeBase.morseRules.rules) {
      const ruleTitle = rule.title.toLowerCase();
      const keywords = directKeywords[ruleTitle] || [];
      const isDirectMatch = keywords.some(kw => text.includes(kw));
      if (isDirectMatch) {
        matched.push(rule);
      }
    }
    return matched;
  }

  /**
   * Trích xuất ký tự mục tiêu từ câu hỏi.
   */
  _extractTargetCharacter(text) {
    const patterns = [
      /(?:chữ|ký tự|mã|morse)\s*([a-z0-9])/i,
      /([a-z0-9])\s*(?:là gì|trong morse|morse là gì)/i,
      /(?:tín hiệu|hiệu)\s*([a-z0-9])\s*(?:là gì|trong morse)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].toUpperCase();
    }
    return null;
  }

  /**
   * Kiểm tra câu hỏi có nằm trong phạm vi Morse/knowledge base không.
   * Trả về true nếu liên quan, false nếu ngoài phạm vi.
   */
  isRelevant(question) {
    const text = question.trim().toLowerCase();
    // Các từ khóa liên quan đến Morse
    const morseKeywords = [
      'morse', 'mã morse', 'tích', 'tà', 'sos', 'dot', 'dash',
      'ký tự', 'chữ', 'mã', 'tín hiệu', 'phát', 'thu',
      'báo vụ', 'telegraph', 'điện报',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    ];
    return morseKeywords.some(kw => text.includes(kw));
  }

  /**
   * Tìm câu trả lời dựa trên câu hỏi.
   */
  ask(question) {
    const text = question.trim().toLowerCase();

    // 1. Người dùng nhập Morse
    if (/^[.\-\s]+$/.test(text)) {
      const answer = this.decodeMorse(text);
      return {
        type: 'morse_decode',
        answer: answer,
        message: `Mã Morse "${text}" được giải mã là "${answer}".`
      };
    }

    // 2. Hỏi về ký tự
    const characterMatch = text.match(/(?:chữ|ký tự|mã|mã)?\s*([a-z])/);

    if (
      characterMatch &&
      (text.includes('morse') || text.includes('chữ') || text.includes('ký tự'))
    ) {
      const character = characterMatch[1];
      const result = this.findCharacter(character);

      if (result) {
        return {
          type: 'character',
          answer: result.character,
          code: result.code,
          message:
            `Chữ ${result.character} trong Morse là ${result.code}. ` +
            result.description
        };
      }
    }

    // 3. Hỏi về tích
    if (text.includes('tích')) {
      const rule = knowledgeBase.morseRules.rules.find(
        item => item.title.toLowerCase() === 'tích'
      );
      return {
        type: 'rule',
        message: rule ? rule.content : 'Tích là tín hiệu Morse ngắn.'
      };
    }

    // 4. Hỏi về tà
    if (text.includes('tà')) {
      const rule = knowledgeBase.morseRules.rules.find(
        item => item.title.toLowerCase() === 'tà'
      );
      return {
        type: 'rule',
        message: rule ? rule.content : 'Tà là tín hiệu Morse dài.'
      };
    }

    // 5. SOS
    if (text.includes('sos')) {
      return {
        type: 'morse_decode',
        answer: 'SOS',
        message: 'SOS trong Morse là ... --- ...'
      };
    }

    // 6. Không tìm thấy
    return {
      type: 'unknown',
      message:
        'Mình chưa tìm thấy thông tin phù hợp. ' +
        'Bạn có thể hỏi về mã Morse, ký tự hoặc tín hiệu tích/tà.'
    };
  }

  /**
   * ước tính số token (rough estimate).
   * Tiếng Việt: ~1.5-2 tokens/word, English: ~1-1.5 tokens/word
   */
  estimateTokens(text) {
    if (!text) return 0;
    const words = text.trim().split(/\s+/).length;
    const chars = text.length;
    // Rough: 1 token ≈ 4 chars tiếng Anh, 1 token ≈ 2 chars tiếng Việt
    return Math.ceil(chars / 3);
  }

  /**
   * Kiểm tra token budget trước khi gọi LLM.
   * Trả về { ok, inputTokens, outputTokens, totalTokens, message }
   */
  checkTokenBudget(systemPrompt, userPrompt, maxTokens) {
    const systemTokens = this.estimateTokens(systemPrompt);
    const inputTokens = this.estimateTokens(userPrompt);
    const outputTokens = maxTokens || 256;
    const totalTokens = systemTokens + inputTokens + outputTokens;

    const MAX_TOTAL = 1024;  // Context window an toàn cho model nhỏ
    const MAX_INPUT = 600;   // System + user prompt không quá 600 tokens

    const inputTotal = systemTokens + inputTokens;

    if (inputTotal > MAX_INPUT) {
      return {
        ok: false,
        inputTokens,
        outputTokens,
        totalTokens: inputTotal,
        message: `Prompt quá dài: ~${inputTotal} tokens (tối đa ${MAX_INPUT}). Hãy rút gọn câu hỏi.`
      };
    }

    if (totalTokens > MAX_TOTAL) {
      return {
        ok: false,
        inputTokens,
        outputTokens,
        totalTokens,
        message: `Tổng tokens ~${totalTokens} vượt quá ${MAX_TOTAL}. Giảm maxTokens hoặc prompt.`
      };
    }

    return {
      ok: true,
      inputTokens,
      outputTokens,
      totalTokens,
      message: `OK: ~${inputTokens} input + ${outputTokens} output = ~${totalTokens} tokens`
    };
  }
}

export default new KnowledgeService();
