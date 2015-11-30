/// <reference path="jquery.d.ts" />
interface Dict<T> {
    [index: string]: T;
}
declare module cryptogame {
    type GameLocation = [string, string];
    interface MissionTheatre {
        organizations: string[];
        locations: GameLocation[];
    }
    interface Alphabet {
        name: string;
        letters: string[];
        substitutes: string[];
        punctuation: string;
    }
    interface GameDatabase {
        name: string;
        description: string;
        templates: Dict<string[]>;
        components: Dict<string[]>;
        variables: Dict<any[]>;
        theatres: Dict<MissionTheatre>;
        alphabets: Dict<Alphabet>;
        makeQueryFunc: (theatreName?: string, Random?: lincore.Random) => ((name: string, key: string | number) => string);
    }
    var HTML: {
        CIPHER_MSG_LETTER: string;
        CIPHER_MSG_SUBST: string;
        CIPHER_MSG_LETTER_ROW: string;
        CIPHER_MSG_SUBST_ROW: string;
    };
}
declare module lincore {
    class Random {
        seed: number;
        constructor(seed?: number);
        reseed(seed?: number): void;
        next(max?: number, min?: number): number;
        nextInt(max: number, min?: number): number;
        pick1<T>(arr: T[]): T;
        pick<T>(arr: T[], amount?: number): T[];
    }
}
declare module cryptogame {
    class MessageComposer {
        random: lincore.Random;
        query: (variable: string, key?: string | number) => string;
        message: string;
        private variableRegex;
        constructor(random?: lincore.Random);
        getHash(): number;
        private makeReplacerFunc();
        compose(database: GameDatabase, templateName?: string, theatre?: string): string;
    }
}
declare module lincore {
    class Parameters {
        dict: Dict<string>;
        constructor(dict: Dict<string> | string);
        remove(key: string): boolean;
        has(key: string): boolean;
        set(key: string, value: string): void;
        get(key: string, def?: string): string;
        getInt(key: string, def?: number): number;
        getFloat(key: string, def?: number): number;
        private fromSearchString(str);
        toSearchString(...exceptions: string[]): string;
    }
}
declare module lincore {
    function createSetOf(arry: any[]): any;
    function getInvertedKvs(obj: {}): {};
    function flatcopy(obj: {}): {};
    function parseSearchString(str: string): Dict<string>;
    function getUrlPart(str: string): string;
    function strRepeat(str: string, times: number): string;
    function padLeft(str: string, len: number, padding?: string): string;
    function padRight(str: string, len: number, padding?: string): string;
    function getNextNode(node: any): any;
    function getNodesInRange(range: Range): any[];
}
declare module cryptogame {
    class SimpleCipher {
        dictionary: Dict<string>;
        alphabet: Alphabet;
        maxLetterLength: number;
        random: lincore.Random;
        message: string;
        cipher: string[];
        letterCounts: Dict<number>;
        options: {};
        substituteSet: Dict<boolean>;
        constructor(alphabet: Alphabet, options?: {}, random?: lincore.Random);
        countLetters(): Dict<number>;
        filter(ngram: string): boolean[];
        checkSolution(solution: Dict<string>): boolean | number;
        encode(msg: string): string[];
        private randomizeSubstitutes();
        private getNextLetter(msg, index);
    }
}
declare var covertActionData: cryptogame.GameDatabase;
declare module cryptogame {
    class GameLogic {
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
        constructor(params: lincore.Parameters, data: Dict<GameDatabase>, difficulties: {}[]);
        newGame(): void;
        addTranslation(subst: string, transl?: string): boolean;
        isGameWon(): boolean;
        hasSubstitute(subst: any): boolean;
        hasLetter(letter: any): boolean;
        createMessage(): void;
        createCipher(): void;
    }
}
declare module cryptogame {
    class GameView {
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
        constructor(params: lincore.Parameters);
        init(): void;
        setMark(m: boolean[], cipher: SimpleCipher, translation: Dict<string>): void;
        private getTimerFunc();
        print(cipher: SimpleCipher, translation: Dict<string>): void;
        showWinState(): void;
        newGame(seed: number, msgLength: number): void;
    }
    class HtmlPrinter {
        cipher: SimpleCipher;
        lineWidth: number;
        private n;
        private letters;
        private substitutes;
        private mark;
        constructor(lineWidth?: number);
        printDictionary(cipher: cryptogame.SimpleCipher, playerSubsts: Dict<string>): string;
        printMessage(cipher: cryptogame.SimpleCipher, playerSubsts: Dict<string>, mark?: boolean[]): string;
        private printCipherLetter(letter, index, output);
        private isLetter(str);
        private isSubstitute(str);
        private printCipherSubst(subst, output);
        private printLetterRow(msg, offset, output);
        private printSubstRow(msg, playerSubsts, offset, output);
    }
}
declare var game: cryptogame.GameController;
declare module cryptogame {
    class GameController {
        logic: GameLogic;
        view: GameView;
        params: lincore.Parameters;
        datasets: Dict<GameDatabase>;
        difficulties: ({} | {
            stripPunctuation: boolean;
        } | {
            stripWhitespace: boolean;
        } | {
            stripPunctuation: boolean;
            stripWhitespace: boolean;
        })[];
        ngramInput: JQuery;
        ngramFilter: string;
        enteredSubst: string;
        constructor();
        init(): void;
        win(): void;
        private addTranslation(subst, transl);
        private onLetterSelect(letter);
        setFilter(filter: string): void;
        private setupHooks();
        play(): void;
    }
}
