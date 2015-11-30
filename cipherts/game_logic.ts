/// <reference path="util/random.ts"/>
/// <reference path="util/param.ts"/>
/// <reference path="util/util.ts"/>
/// <reference path="cipher_simple.ts"/>
/// <reference path="composer.ts"/>
/// <reference path="data/covert_data.ts"/>

module cryptogame {
    export class GameLogic {
        params: lincore.Parameters;
        cipher: SimpleCipher;
        random: lincore.Random;
        composer: MessageComposer;
        alphabet: Alphabet;
        datasets: Dict<GameDatabase>;
        difficulties: {}[];
        difficulty: {};
        db: GameDatabase;
        message: string;
        translation: Dict<string>;      

        onNewGame: (gameLogic: GameLogic) => void;
        onTranslChange: (gameLogic: GameLogic) => void;
        onGameWon: (gameLogic: GameLogic) => void;

        constructor(params: lincore.Parameters, data: Dict<GameDatabase>, difficulties: {}[]) {
            this.params = params;
            this.datasets = data;
            this.difficulties = difficulties;            
            this.difficulty = difficulties[params.getInt("difficulty", 0)];
            this.random = new lincore.Random(params.getInt("seed"));
            this.composer = new MessageComposer(this.random);
        }

        newGame() {
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
            var key = this.params.get("db", "default");
            this.db = this.datasets[key];
            var theatre = this.params.get("theatre");
            var template = this.params.get("template");
            this.message = this.composer.compose(this.db, template, theatre);
        }

        createCipher() {
            this.alphabet = this.db.alphabets[this.params.get("alphabet", "latin")];
            this.cipher = new SimpleCipher(this.alphabet, this.difficulty);
            this.cipher.encode(this.message);
            this.cipher.countLetters();
        }
    }
}