interface Dict<T> { [index: string]: T; }


module cryptogame {
    export type GameLocation = [string, string];

    export interface Difficulty {
        name: string;
        desc: string;
        id: number;
        options: {};
    }

    export interface MissionTheatre {
        organizations: string[];
        locations: GameLocation[];
    }

    export interface Alphabet {
        name: string;
        letters: string[];
        substitutes: string[];
        punctuation: string;
    }

    export interface GameDatabase {
        name: string;
        description: string;
        templates: Dict<string[]>;
        components: Dict<string[]>;
        variables: Dict<any[]>;
        theatres: Dict<MissionTheatre>;
        alphabets: Dict<Alphabet>;
        difficulties: Difficulty[];
        makeQueryFunc: (theatreName?: string, Random?: lincore.Random) =>
            ((name: string, key: string | number) => string);
    }


    export var HTML = {
        CIPHER_MSG_LETTER: "cipher_msg_letter",
        CIPHER_MSG_SUBST: "cipher_msg_subst",
        CIPHER_MSG_LETTER_ROW: "cipher_msg_letter_row",
        CIPHER_MSG_SUBST_ROW: "cipher_msg_subst_row",
    }
}