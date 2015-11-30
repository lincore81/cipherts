/// <reference path="definitions.ts" />
/// <reference path="util/random.ts" />
module cryptogame {
    export class MessageComposer {
        random: lincore.Random;
        query: (variable: string, key?: string | number) => string;
        message: string;

        private variableRegex = /\$(\w+)(?:(?:\:(\w+))|(?:\#(\d+)))?/g;

        constructor(random?: lincore.Random) {
            this.random = random || new lincore.Random();
        }

        getHash() {
            var i, chr, len;
            var hash = 0;
            if (this.message.length == 0) return hash;
            for (i = 0, len = this.message.length; i < len; i++) {
                chr = this.message.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        }

        private makeReplacerFunc() {
            var query = this.query;
            return (substring: string, variable: string, keystr?: string, keynum?: string): string  => {
                var key: string | number = undefined;
                if (keystr !== undefined || keynum !== undefined) {

                    if (keystr !== undefined) {
                        key = keystr;
                    } else if (keynum !== undefined) {
                        key = parseInt(keynum);
                        if (key === NaN) throw "key is NaN: " + keynum;
                    }
                }
                return query(variable, key);
            }
        }

        compose(database: GameDatabase, templateName?: string, theatre?: string): string {
            templateName = templateName || this.random.pick1(Object.keys(database.templates));
            var template = database.templates[templateName];
            template = this.random.pick(template, template.length);
            var ans = [];
            for (var i in template) {
                var t = template[i];
                ans.push(this.random.pick1(database.components[t]));
            }
            this.query = database.makeQueryFunc(theatre, this.random);
            var msg = ans.join(" ").replace(this.variableRegex, this.makeReplacerFunc());
            this.message = msg;
            return msg;
        }
    }
}