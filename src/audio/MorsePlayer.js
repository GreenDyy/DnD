import Sound from "react-native-sound";
import MORSE_MAP from "./morseMap";

Sound.setCategory("Playback");

const tic = new Sound("tic.wav", Sound.MAIN_BUNDLE);
const ta = new Sound("tic.wav", Sound.MAIN_BUNDLE);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

class MorsePlayer {

    constructor() {
        this.unit = 60;
        this.queue = Promise.resolve();
        this.isPlaying = false;
        this.stopRequested = false;
    }

    setWpm(wpm) {
        this.unit = Math.round(1200 / wpm);
    }

    async playSound(sound) {
        return new Promise(resolve => {
            sound.stop(() => {
                sound.play(() => resolve());
            });
        });
    }

    async playDot() {
        await this.playSound(tic);
    }

    async playDash() {
        await this.playSound(ta);
    }

    async playCode(code) {

        if (!code) return;

        this.isPlaying = true;
        this.stopRequested = false;

        for (let i = 0; i < code.length; i++) {

            if (this.stopRequested)
                break;

            const c = code[i];

            if (c === ".") {
                await this.playDot();
            }
            else if (c === "-") {
                await this.playDash();
            }

            if (i < code.length - 1)
                await sleep(this.unit);
        }

        this.isPlaying = false;
    }

    playCharacter(char) {
        console.log(`Playing character: ${char}`);
        const code = MORSE_MAP[char.toUpperCase()];

        if (!code)
            return;

        this.queue = this.queue.then(async () => {
            await this.playCode(code);
            await sleep(this.unit * 3);
        });

        return this.queue;
    }

    playText(text) {

        this.queue = this.queue.then(async () => {

            const chars = text.toUpperCase().split("");

            for (const c of chars) {

                if (this.stopRequested)
                    break;

                if (c === " ") {

                    await sleep(this.unit * 7);
                    continue;
                }

                const code = MORSE_MAP[c];

                if (!code)
                    continue;

                await this.playCode(code);

                await sleep(this.unit * 3);
            }

        });

        return this.queue;
    }

    stop() {

        this.stopRequested = true;

        tic.stop();
        ta.stop();

        this.isPlaying = false;
    }

}

export default new MorsePlayer();