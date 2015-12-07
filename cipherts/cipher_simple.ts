/// <reference path="definitions.ts"/>
/// <reference path="util/random.ts"/>

module cryptogame {
    export class SimpleCipher {
        dictionary: Dict<string>;
        alphabet: Alphabet;
        maxLetterLength: number;
        random: lincore.Random;
        message: string;
        cipher: string[];
        letterCounts: Dict<number>;
        options: {};
        substituteSet: Dict<boolean>;


        constructor(alphabet: Alphabet, options?: {}, random?: lincore.Random) {
            if (alphabet.letters.length == 0 || alphabet.substitutes.length == 0) {
                throw "alphabet is empty: " + alphabet;
            }
            if (alphabet.letters.length != alphabet.substitutes.length) {
                throw "Invalid alphabet, must have an equal amount of letters and substitutes: " + alphabet;
            }
            this.alphabet = alphabet;
            this.substituteSet = lincore.Set(alphabet.substitutes);
            this.random = random || new lincore.Random();
            this.options = options || {};
            this.randomizeSubstitutes();
        }

        countLetters() {
            this.letterCounts = {};
            for (var i = 0; i < this.alphabet.substitutes.length; i++) {
                this.letterCounts[this.alphabet.substitutes[i]] = 0;
            }
            for (var i = 0; i < this.cipher.length; i++) {
                var letter = this.cipher[i];
                this.letterCounts[letter]++;
            }
            return this.letterCounts;
        }


        //TODO: handle alphabets with multi-character letters
        filter(ngram: string): boolean[] {
            var ans: boolean[] = [];
            if (!ngram) return ans;
            var i = 0;
            var l = ngram.length;
            var match = () => {
                var j;
                for (j = 0; j < l; j++) {
                    var ch = ngram.charAt(j);
                    var subst = this.cipher[i + j];
                    if (ch === '_' && !this.substituteSet.hasOwnProperty(subst) ||
                        ch !== '_' && this.cipher[i + j] !== ch)
                    {
                        i++;
                        return false;
                    }
                }
                for (j = 0; j < l; j++) {
                    ans[i + j] = true;
                }
                i += l;
                return true;
            };
            var cipherlen = this.cipher.length;
            while (i < cipherlen) {
                match();
            }
            return ans;
        }

        checkSolution(solution: Dict<string>): boolean | number {
            var unsolved = 0;
            for (var i = 0; i < this.alphabet.letters.length; i++) {
                var letter = this.alphabet.letters[i];
                var equal = this.dictionary[solution[letter]] === letter;
                if (this.letterCounts[letter] > 0 && !equal) {
                    if (solution[letter].match(/\S+/)) {
                        return false;
                    } else {
                        unsolved++;
                    }
                }
            }
            return unsolved;
        }

        encode(msg: string): string[] {
            msg = msg.toUpperCase();
            this.message = msg;
            this.cipher = [];
            var i = 0;
            while (i < msg.length) {
                var next = this.getNextLetter(msg, i);
                if (next !== null) {
                    this.cipher.push(next.letter);
                    i += next.length;
                } else {
                    var ch = this.message.charAt(i);
                    i++;
                    if (ch == " " && this.options["stripWhitespace"]) {
                        continue;
                    } else if (this.alphabet.punctuation.indexOf(ch) != -1 &&
                        this.options["stripPunctuation"]) {
                        continue;
                    } else {
                        this.cipher.push(ch);
                    }
                }
            }
            return this.cipher;
        }

        private randomizeSubstitutes() {
            this.dictionary = {};
            this.maxLetterLength = 0;
            var substitutes = this.alphabet.substitutes.slice();
            substitutes = this.random.pick(substitutes, substitutes.length);
            for (var i = 0; i < substitutes.length; i++) {
                var letter = this.alphabet.letters[i];
                this.dictionary[letter] = substitutes[i];
                if (letter.length > this.maxLetterLength) {
                    this.maxLetterLength = letter.length;
                }
            }
        }

        private getNextLetter(msg: string, index: number): { letter: string, length: number } {
            for (var len = this.maxLetterLength; len > 0; len--) {
                var s = msg.substr(index, len);
                if (this.dictionary[s] !== undefined) {
                    return { letter: this.dictionary[s], length: len };
                }
            }
            return null;
        }

        
    }
}