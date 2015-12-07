///<reference path="jquery.d.ts" />
///<reference path="game_logic.ts" />
///<reference path="game_view.ts" />
///<reference path="util/keys.ts" />

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
        pickerDlg: SubstitutionPickerDlg;
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
        ngramClear: JQuery;
        ngramFilter: string;
        enteredSubst: string;

        constructor() {
            this.params = new lincore.Parameters(document.location.search);
            this.logic = new GameLogic(this.params, this.datasets, this.difficulties);
            this.view = new GameView(this.params);
            this.ngramFilter = "";
            this.pickerDlg = new SubstitutionPickerDlg();
        }

        init() {
            this.ngramInput = $('input[name="ngram_input"]');
            this.ngramClear = $('button[name="ngram_clear"]');
            this.view.init();
            this.setupHooks();
            this.pickerDlg.init();
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

        private onLetterTyped(letter) {
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


        private static onSubstClick(event: JQueryEventObject) {
            var clicked = $(event.target);
            if (!clicked.hasClass("in_alphabet") && !clicked.hasClass("cipher_dict_subst")) return;
            var self = <GameController>event.data;            
            var subst = clicked.attr("data-letter");
            self.pickerDlg.show(subst);
        }

        setFilter(filter: string) {
            filter = filter.toLocaleUpperCase();
            if (filter !== this.ngramFilter) {
                this.ngramFilter = filter;
                var mark = this.logic.cipher.filter(filter);
                this.view.setMark(mark, this.logic.cipher, this.logic.translation);
                if (filter !== "") {
                    this.ngramClear.removeClass("invisible");
                } else {
                    this.ngramClear.addClass("invisible");
                }
            }
        }

        private setupHooks() {
            var inst = this;
            $("html").keyup((event) => {
                if (lincore.isSpecialKey(event.originalEvent)) return;
                if (!$(document.activeElement).is("body")) return;
                var ch = String.fromCharCode(event.which).toUpperCase();
                inst.onLetterTyped(ch);
            });
            this.ngramInput.bind("change paste keyup", (event) => {
                if (event.which === 27) {
                    this.ngramInput.val("");
                    this.ngramInput.get(0).blur();
                } else if (event.which === 13) {
                    this.ngramInput.get(0).blur();
                    return;
                } 
                inst.setFilter(this.ngramInput.val());
            });
            this.ngramClear.bind("click", (event) => {
                this.ngramInput.val("");
                this.ngramInput.change();
            });
            $("#dict_content").click(this, GameController.onSubstClick);
            $("#cipher_message").click(this, GameController.onSubstClick);
        }

        play() {
            var seed = this.logic.random.seed;
            this.logic.newGame();
            var cipher = this.logic.cipher;
            var msgLength = cipher.cipher.length;
            this.view.newGame(seed, msgLength, cipher.alphabet.letters);
            this.view.print(cipher, this.logic.translation);
            var self = this;
            this.pickerDlg.populate(cipher.alphabet.letters, (subst, transl) => {
                self.pickerDlg.hide();
                self.addTranslation(subst, transl);
            });
        }
    }
}

