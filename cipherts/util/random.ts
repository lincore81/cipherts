module lincore {
    export class Random {
        seed: number;

        constructor(seed?: number) {
            this.reseed(seed);
        }

        reseed(seed?: number) {
            this.seed = (seed || seed === 0) ? seed :
                Math.floor(Math.random() * Math.pow(2, 32)) - 1;
        }

        next(max?: number, min?: number): number {
            max = max || 1;
            min = min || 0;
            this.seed = (this.seed * 9301 + 49297) % 233280;
            var rnd = this.seed / 233280.0;
            rnd = min + rnd * (max - min);
            return rnd;
        }

        nextInt(max: number, min?: number): number {
            return Math.floor(this.next(max, min));
        }

        pick1<T>(arr: T[]): T {
            if (!arr) throw "Missing arr.";
            if (arr.length == 0) throw "given array is empty.";
            return arr[this.nextInt(arr.length)];
        }

        pick<T>(arr: T[], amount?: number): T[] {
            if (!arr) throw "Missing arr.";
            if (amount < 0) throw "amount must be positive";
            amount = amount || 1;
            if (amount > arr.length) throw "arr is not large enough to pick " + amount + " items.";
            if (amount == 1) {
                return [arr[this.nextInt(arr.length)]];
            } else {
                var copy = arr.slice();
                var ans = [];
                for (var n = 0; n < amount; n++) {
                    var idx = this.nextInt(copy.length);
                    ans.push(copy[idx]);
                    copy.splice(idx, 1);
                }
                return ans;
            }
        }
    }
}