/// <reference path="util/random.ts"/>
/// <reference path="util/param.ts"/>
/// <reference path="util/util.ts"/>
/// <reference path="cipher_simple.ts"/>
/// <reference path="composer.ts"/>
/// <reference path="data/covert_data.ts"/>

module cryptogame {
    export class GameLogic {
        cipher: SimpleCipher;
        random: lincore.Random;
        composer: MessageComposer;
        difficulty: Difficulty;
        alphabet: Alphabet;
        db: GameDatabase;
        message: string;
        translation: Dict<string>;      

        onNewGame: (gameLogic: GameLogic) => void;
        onTranslChange: (gameLogic: GameLogic) => void;
        onGameWon: (gameLogic: GameLogic) => void;

        constructor() {
            this.random = new lincore.Random(settings.params.getInt("seed"));
            this.composer = new MessageComposer(this.random);
        }

        newGame(db: GameDatabase) {
            this.db = db;
            this.createMessage();
            this.createCipher();
            this.translation = {};
            var len = this.alphabet.substitutes.length;
            for (var i = 0; i < len; i++) {
                this.translation[this.alphabet.substitutes[i]] = "";
            }
            if (this.onNewGame) this.onNewGame(this);
            if (this.onTranslChange) this.onTranslChange(this);
        }

        addTranslation(subst: string, transl?: string): boolean {
            transl = transl || "";
            if (this.translation[subst] != transl) {
                this.translation[subst] = transl;
                return true;
            }
            return false;
        }

        isGameWon() {
            var missing = this.cipher.checkSolution(this.translation);
            return missing !== false && missing < 2;
        }

        hasSubstitute(subst) {
            return this.cipher.alphabet.substitutes.indexOf(subst) != -1;
        }

        hasLetter(letter) {
            return this.cipher.alphabet.letters.indexOf(letter) != -1;
        }
        createMessage() {
            var theatre = settings.params.get("theatre");
            var template = settings.params.get("template");
            this.message = this.composer.compose(this.db, template, theatre);
        }

        createCipher() {
            var diff = settings.params.getInt("difficulty", 0);
            this.difficulty = this.db.difficulties[diff];
            var alphabetName = settings.params.get("alphabet", this.difficulty["alphabet"] || "default");
            this.alphabet = this.db.alphabets[alphabetName];
            this.cipher = new SimpleCipher(this.alphabet, this.difficulty.options);
            this.cipher.encode(this.message);
            this.cipher.countLetters();
        }
    }
}