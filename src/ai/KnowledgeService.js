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
}

export default new KnowledgeService();
