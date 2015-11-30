///<reference path="jquery.d.ts" />
///<reference path="game_logic.ts" />
///<reference path="game_view.ts" />

var game: cryptogame.GameController;
$(() => {
    game = new cryptogame.GameController();
    game.init();
    game.play();
})

module cryptogame {
    export class GameController {
        logic: GameLogic;
        view: GameView;
        params: lincore.Parameters;
        datasets: Dict<GameDatabase> = {
            "covert_action": covertActionData,
            "default": covertActionData
        };
        difficulties = [
            {},
            { stripPunctuation: true },
            { stripWhitespace: true },
            { stripPunctuation: true, stripWhitespace: true }
        ];

        ngramInput: JQuery;
        ngramFilter: string;
        enteredSubst: string;

        constructor() {
            this.params = new lincore.Parameters(document.location.search);
            this.logic = new GameLogic(this.params, this.datasets, this.difficulties);
            this.view = new GameView(this.params);
            this.ngramFilter = "";
        }

        init() {
            this.ngramInput = $('input[name="ngram_input"]');
            this.view.init();
            this.setupHooks();
        }

        win() {
            this.params.remove("seed");
            var transl: Dict<string> = <Dict<string>>lincore.getInvertedKvs(this.logic.cipher.dictionary);
            this.view.print(this.logic.cipher, transl);
            this.view.showWinState();
        }

        private addTranslation(subst:string, transl:string) {
            transl = transl == " " ? undefined : transl;
            if (this.logic.addTranslation(subst, transl)) {
                if (this.logic.isGameWon()) {
                    this.win();
                } else {
                    this.view.print(this.logic.cipher, this.logic.translation);
                }
            }
        }

        private onLetterSelect(letter) {
            if (this.enteredSubst) {
                $(`.cipher_dict_subst:contains("${this.enteredSubst}")`).removeClass("blink");
                if (letter == " " || letter && this.logic.hasSubstitute(letter)) {
                    this.addTranslation(this.enteredSubst, letter);
                }
                this.enteredSubst = "";
            } else if (letter && this.logic.hasLetter(letter)) {
                this.enteredSubst = letter;
                $(`.cipher_dict_subst:contains("${letter}")`).addClass("blink");
            }
        }

        setFilter(filter: string) {
            filter = filter.toLocaleUpperCase();
            if (filter !== this.ngramFilter) {
                this.ngramFilter = filter;
                var mark = this.logic.cipher.filter(filter);
                this.view.setMark(mark, this.logic.cipher, this.logic.translation);
            }
        }

        private setupHooks() {
            var inst = this;
            $("html").keyup((event) => {
                if (!$(document.activeElement).is("body")) return;
                var ch = String.fromCharCode(event.which).toUpperCase();
                inst.onLetterSelect(ch);
            });
            $(this.ngramInput).bind("change paste keyup", (event) => {
                if (event.which === 27) {
                    this.ngramInput.val("");
                    this.ngramInput.get(0).blur();
                } else if (event.which === 13) {
                    this.ngramInput.get(0).blur();
                    return;
                }
                inst.setFilter(this.ngramInput.val());
            });
        }

        play() {
            var seed = this.logic.random.seed;
            this.logic.newGame();
            this.view.newGame(seed, this.logic.cipher.message.length);
            this.view.print(this.logic.cipher, this.logic.translation);
        }
    }
}

