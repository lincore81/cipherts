module cryptogame {
    export class GameView {
        printer: HtmlPrinter;
        params: lincore.Parameters;
        messageElem: JQuery;
        tryAnotherElem: JQuery;
        winDlgElem: JQuery;
        dictElem: JQuery;
        timerHandle: number;
        timerElem: JQuery;
        msgIdElem: JQuery;
        timePassed: number;
        mark: boolean[];

        constructor(params: lincore.Parameters) {
            this.printer = new HtmlPrinter(params.getInt("width"));
            this.params = params;
        }

        init() {
            $(".noscript").addClass("hidden");
            $("#game_wrapper").removeClass("hidden");
            this.messageElem = $("div#cipher_message");
            this.dictElem = $("div#dict_content");
            this.timerElem = $("#timer");
            this.msgIdElem = $("span#msg_id");
            this.tryAnotherElem = $("#try_another");
            this.winDlgElem = $("#win_dlg");
        }
        

        setMark(m: boolean[], cipher: SimpleCipher, translation: Dict<string>) {
            this.mark = m;
            this.print(cipher, translation);
        }

        private getTimerFunc() {
            var instance = this;
            return () => {
                instance.timePassed += 1;
                var secs = instance.timePassed % 60;
                var mins = Math.floor(instance.timePassed / 60);
                var secstr = lincore.padLeft(mins.toString(), 2, "0");
                var minstr = lincore.padLeft(secs.toString(), 2, "0");
                instance.timerElem.text(secstr + ":" + minstr);
            };
        }

        print(cipher: SimpleCipher, translation: Dict<string>) {
            this.messageElem.html(this.printer.printMessage(cipher, translation, this.mark));
            this.dictElem.html(this.printer.printDictionary(cipher, translation));
        }

        showWinState() {
            clearInterval(this.timerHandle);
            this.tryAnotherElem.html(`<a href="javascript:game.play();">TRY ANOTHER?</a>`);
            this.winDlgElem.removeClass("hidden");
        }

        newGame(seed: number, msgLength: number) {
            this.timePassed = 0;            
            this.timerHandle = setInterval(this.getTimerFunc(), 1000);
            this.winDlgElem.addClass("hidden");
            var p = new lincore.Parameters(<Dict<string>>lincore.flatcopy(this.params.dict));
            p.dict["seed"] = "" + seed;
            console.log(p);
            var url = lincore.getUrlPart(window.location.href);
            this.msgIdElem.html(
                `<a href="${url}/${p.toSearchString() }" title="link to this cipher">${seed}</a>,
                 Len:${msgLength}`);
        }
    }

    export class HtmlPrinter {
        cipher: SimpleCipher;
        lineWidth: number;
        private n = 0;
        private letters = {};
        private substitutes = {};
        private mark: boolean[];

        constructor(lineWidth?: number) {
            this.lineWidth = lineWidth || 42;
        }

        printDictionary(cipher: cryptogame.SimpleCipher, playerSubsts: Dict<string>) {
            // row: subst, letter, count
            var output: string[] = [];
            for (var i = 0; i < cipher.alphabet.letters.length; i++) {
                var letter = cipher.alphabet.letters[i];
                var s1: string = playerSubsts[cipher.alphabet.letters[i]] || "";
                s1 = lincore.padRight(s1, cipher.maxLetterLength);
                var s2 = cipher.alphabet.substitutes[i];
                var count = cipher.letterCounts[letter];
                output.push(
                    `<div class="cipher_dict_row">
                        <div class="cipher_dict_transl">${s1}</div>
                        <div class="cipher_dict_subst">${s2}</div>
                        <div class="cipher_dict_count">${count}</div>
                    </div>`);
            }
            return output.join("");
        }

        printMessage(cipher: cryptogame.SimpleCipher, playerSubsts: Dict<string>, mark?: boolean[]): string {
            this.mark = mark || [];
            this.cipher = cipher;
            this.letters = cipher.alphabet.letters;
            this.substitutes = cipher.substituteSet;
            this.n = 0;
            var output: string[] = [];
            for (var i = 0; i < cipher.cipher.length; i += this.lineWidth) {
                output.push('<div class="cipher_msg_row">');
                this.printLetterRow(this.cipher.cipher, i, output);
                this.printSubstRow(this.cipher.cipher, playerSubsts, i, output);
                output.push('</div>');
            }
            return output.join("");
        }

        private printCipherLetter(letter: string, index: number, output: string[]) {
            var clazz = HTML.CIPHER_MSG_LETTER;
            var dataAttrib = "";
            if (letter !== " " || this.cipher.alphabet.punctuation.indexOf(letter) != -1) {
                clazz += " in_alphabet";
                dataAttrib = `data-letter="${letter}"`;
            }
            if (this.mark[index]) {
                clazz += " marked";
            }
            output.push(
                `<span class="${clazz}" ${dataAttrib}>${letter}</span>`);
        }

        private isLetter(str: string): boolean {
            return this.letters[str] !== undefined;
        }

        private isSubstitute(str: string): boolean {
            return this.substitutes[str] !== undefined;
        }

        private printCipherSubst(subst: string, output: string[]) {
            var out: string;
            if (subst) {
                out = `<span class="${HTML.CIPHER_MSG_SUBST} in_alphabet" data-subst="${subst } ">${subst}</span>`;
            } else {
                out = `<span class="${HTML.CIPHER_MSG_SUBST}"> </span>`;
            }
            output.push(out);
        }

        private printLetterRow(msg: string[], offset: number, output: string[]) {
            output.push('<div class="cipher_msg_letter_row">');
            var max = Math.min(offset + this.lineWidth, msg.length);
            for (var i = offset; i < max; i++) {                
                this.printCipherLetter(msg[i], i, output);
            }
            var endl = offset + this.lineWidth - 1;
            if (endl + 1 < msg.length) {
                var wrap = msg.slice(endl, endl + 2);
                if (this.isSubstitute(wrap[0]) && this.isSubstitute(wrap[1])) {
                    output.push('<span class="cipher_msg_letter">-</span>');
                }
            }
            output.push('</div>\n');
        }

        private printSubstRow(msg: string[], playerSubsts: Dict<string>, offset: number, output: string[]) {
            output.push('<div class="cipher_msg_subst_row">');
            var max = Math.min(offset + this.lineWidth, msg.length);
            for (var i = offset; i < max; i++) {
                this.printCipherSubst(playerSubsts[msg[i]], output);
            }
            output.push('</div>\n');
        }
    }
}