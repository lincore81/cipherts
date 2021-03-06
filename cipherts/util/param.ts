﻿module lincore {
    export class Parameters {
        dict: Dict<string>;
        constructor(dict?: Dict<string> | string) {
            if (typeof dict === "string") {
                this.fromSearchString(dict);
            } else {
                this.dict = dict || {};
            }
        }

        clone(...except: string[]): Parameters {
            var set = Set(except);
            var dict: Dict<string> = {};
            var keys = Object.keys(this.dict);
            for (var i = 0, len = keys.length; i < len; i++) {
                var key = keys[i];
                if (!set[key]) {
                    dict[key] = this.dict[key];
                }
            }
            return new Parameters(dict);
        }

        remove(key: string): boolean {
            if (this.dict.hasOwnProperty(key)) {
                delete this.dict[key];
                return true;
            } else {
                return false;
            }
        }

        has(key: string): boolean {
            return this.dict.hasOwnProperty(key);
        }

        set(key: string, value: string) {
            this.dict[key] = value;
        }

        setAllIn(other: Parameters) {
            var keys = Object.keys(other.dict);
            for (var i = 0, len = keys.length; i < len; i++) {
                var k = keys[i];
                this.dict[k] = other.dict[k];
            }
            return this;
        }

        get(key: string, def?: string) {
            return this.dict[key] || def;
        }

        getInt(key: string, def?: number) {
            if (!this.dict.hasOwnProperty(key)) return def;
            var int = parseInt(this.dict[key]);
            if (!isNaN(int)) {
                return int;
            } else {
                return def !== undefined ? def : int;
            }
        }

        getFloat(key: string, def?: number) {
            var num = parseFloat(this.dict[key]);
            return num !== NaN ? num : def;
        }

        toJson() {
            return JSON.stringify(this.dict);
        }

        static fromJson(json: string): Parameters {
            return new Parameters(JSON.parse(json));
        }

        private fromSearchString(str: string) {
            //format: "?key1=value1&key2=value2&...&keyN=valueN"
            var searchRegex = /\??(\w+)=(\w+)(?:\&)?/g;
            this.dict = {};
            str.replace(searchRegex, (match: string, key: string, value: string) => {
                this.dict[key] = value;
                return match;
            });            
        }

        toSearchString(...exceptions: string[]): string {
            var exset = lincore.Set(exceptions);
            var keys = Object.keys(this.dict);
            var len = keys.length;
            var pairs = [];
            for (var i = 0; i < len; i++) {
                var key = keys[i];
                if (!exset.hasOwnProperty(key)) {
                    pairs.push(`${key}=${this.dict[key]}`);
                }
            }
            return "?" + pairs.join("&");
        }
    }
}