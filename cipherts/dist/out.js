var cryptogame;
(function (cryptogame) {
    cryptogame.HTML = {
        CIPHER_MSG_LETTER: "cipher_msg_letter",
        CIPHER_MSG_SUBST: "cipher_msg_subst",
        CIPHER_MSG_LETTER_ROW: "cipher_msg_letter_row",
        CIPHER_MSG_SUBST_ROW: "cipher_msg_subst_row"
    };
})(cryptogame || (cryptogame = {}));
var lincore;
(function (lincore) {
    var Random = (function () {
        function Random(seed) {
            this.reseed(seed);
        }
        Random.prototype.reseed = function (seed) {
            this.seed = (seed || seed === 0) ? seed :
                Math.floor(Math.random() * Math.pow(2, 32)) - 1;
        };
        Random.prototype.next = function (max, min) {
            max = max || 1;
            min = min || 0;
            this.seed = (this.seed * 9301 + 49297) % 233280;
            var rnd = this.seed / 233280.0;
            rnd = min + rnd * (max - min);
            return rnd;
        };
        Random.prototype.nextInt = function (max, min) {
            return Math.floor(this.next(max, min));
        };
        Random.prototype.pick1 = function (arr) {
            if (!arr)
                throw "Missing arr.";
            if (arr.length == 0)
                throw "given array is empty.";
            return arr[this.nextInt(arr.length)];
        };
        Random.prototype.pick = function (arr, amount) {
            if (!arr)
                throw "Missing arr.";
            if (amount < 0)
                throw "amount must be positive";
            amount = amount || 1;
            if (amount > arr.length)
                throw "arr is not large enough to pick " + amount + " items.";
            if (amount == 1) {
                return [arr[this.nextInt(arr.length)]];
            }
            else {
                var copy = arr.slice();
                var ans = [];
                for (var n = 0; n < amount; n++) {
                    var idx = this.nextInt(copy.length);
                    ans.push(copy[idx]);
                    copy.splice(idx, 1);
                }
                return ans;
            }
        };
        return Random;
    })();
    lincore.Random = Random;
})(lincore || (lincore = {}));
/// <reference path="definitions.ts" />
/// <reference path="util/random.ts" />
var cryptogame;
(function (cryptogame) {
    var MessageComposer = (function () {
        function MessageComposer(random) {
            this.variableRegex = /\$(\w+)(?:(?:\:(\w+))|(?:\#(\d+)))?/g;
            this.random = random || new lincore.Random();
        }
        MessageComposer.prototype.getHash = function () {
            var i, chr, len;
            var hash = 0;
            if (this.message.length == 0)
                return hash;
            for (i = 0, len = this.message.length; i < len; i++) {
                chr = this.message.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        };
        MessageComposer.prototype.makeReplacerFunc = function () {
            var query = this.query;
            return function (substring, variable, keystr, keynum) {
                var key = undefined;
                if (keystr !== undefined || keynum !== undefined) {
                    if (keystr !== undefined) {
                        key = keystr;
                    }
                    else if (keynum !== undefined) {
                        key = parseInt(keynum);
                        if (key === NaN)
                            throw "key is NaN: " + keynum;
                    }
                }
                return query(variable, key);
            };
        };
        MessageComposer.prototype.compose = function (database, templateName, theatre) {
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
        };
        return MessageComposer;
    })();
    cryptogame.MessageComposer = MessageComposer;
})(cryptogame || (cryptogame = {}));
var lincore;
(function (lincore) {
    var Parameters = (function () {
        function Parameters(dict) {
            if (typeof dict === "string") {
                this.fromSearchString(dict);
            }
            else {
                this.dict = dict || {};
            }
        }
        Parameters.prototype.remove = function (key) {
            if (this.dict.hasOwnProperty(key)) {
                delete this.dict[key];
                return true;
            }
            else {
                return false;
            }
        };
        Parameters.prototype.has = function (key) {
            return this.dict.hasOwnProperty(key);
        };
        Parameters.prototype.set = function (key, value) {
            this.dict[key] = value;
        };
        Parameters.prototype.get = function (key, def) {
            return this.dict[key] || def;
        };
        Parameters.prototype.getInt = function (key, def) {
            var num = parseInt(this.dict[key]);
            return num !== NaN ? num : def;
        };
        Parameters.prototype.getFloat = function (key, def) {
            var num = parseFloat(this.dict[key]);
            return num !== NaN ? num : def;
        };
        Parameters.prototype.fromSearchString = function (str) {
            var _this = this;
            //format: "?key1=value1&key2=value2&...&keyN=valueN"
            var searchRegex = /\??(\w+)=(\w+)(?:\&)?/g;
            this.dict = {};
            str.replace(searchRegex, function (match, key, value) {
                _this.dict[key] = value;
                return match;
            });
        };
        Parameters.prototype.toSearchString = function () {
            var exceptions = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                exceptions[_i - 0] = arguments[_i];
            }
            var exset = lincore.createSetOf(exceptions);
            var keys = Object.keys(this.dict);
            var len = keys.length;
            var pairs = [];
            for (var i = 0; i < len; i++) {
                var key = keys[i];
                if (!exset.hasOwnProperty(key)) {
                    pairs.push(key + "=" + this.dict[key]);
                }
            }
            return "?" + pairs.join("&");
        };
        return Parameters;
    })();
    lincore.Parameters = Parameters;
})(lincore || (lincore = {}));
var lincore;
(function (lincore) {
    var searchRegex = /\??(\w+)=(\w+)(?:\&)?/g;
    function createSetOf(arry) {
        var ans = {};
        for (var i = 0; i < arry.length; i++) {
            ans[arry[i]] = true;
        }
        return ans;
    }
    lincore.createSetOf = createSetOf;
    function getInvertedKvs(obj) {
        var keys = Object.keys(obj);
        var ans = {};
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            ans[obj[key]] = key;
        }
        return ans;
    }
    lincore.getInvertedKvs = getInvertedKvs;
    function flatcopy(obj) {
        if (null == obj || "object" != typeof obj)
            return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr))
                copy[attr] = obj[attr];
        }
        return copy;
    }
    lincore.flatcopy = flatcopy;
    function parseSearchString(str) {
        //format: "?key1=value1&key2=value2&...&keyN=valueN"
        var dict = {};
        str.replace(searchRegex, function (match, key, value) {
            dict[key] = value;
            return match;
        });
        return dict;
    }
    lincore.parseSearchString = parseSearchString;
    function getUrlPart(str) {
        str = str.replace(searchRegex, "");
        if (str.charAt(str.length - 1) == "/")
            str = str.substring(0, str.length - 1);
        return str;
    }
    lincore.getUrlPart = getUrlPart;
    function strRepeat(str, times) {
        return Array(times + 1).join(str);
    }
    lincore.strRepeat = strRepeat;
    function padLeft(str, len, padding) {
        if (padding === void 0) { padding = " "; }
        var plen = len - str.length;
        if (plen <= 0)
            return str;
        return strRepeat(padding, plen) + str;
    }
    lincore.padLeft = padLeft;
    function padRight(str, len, padding) {
        if (padding === void 0) { padding = " "; }
        var plen = len - str.length;
        if (plen <= 0)
            return str;
        return str + strRepeat(padding, plen);
    }
    lincore.padRight = padRight;
    function getNextNode(node) {
        if (node.firstChild)
            return node.firstChild;
        while (node) {
            if (node.nextSibling)
                return node.nextSibling;
            node = node.parentNode;
        }
    }
    lincore.getNextNode = getNextNode;
    // http://stackoverflow.com/questions/667951/how-to-get-nodes-lying-inside-a-range-with-javascript
    function getNodesInRange(range) {
        var start = range.startContainer;
        var end = range.endContainer;
        var commonAncestor = range.commonAncestorContainer;
        var nodes = [];
        var node;
        // walk parent nodes from start to common ancestor
        for (node = start.parentNode; node; node = node.parentNode) {
            nodes.push(node);
            if (node == commonAncestor)
                break;
        }
        nodes.reverse();
        // walk children and siblings from start until end is found
        for (node = start; node; node = getNextNode(node)) {
            nodes.push(node);
            if (node == end)
                break;
        }
        return nodes;
    }
    lincore.getNodesInRange = getNodesInRange;
})(lincore || (lincore = {}));
/// <reference path="definitions.ts"/>
/// <reference path="util/random.ts"/>
var cryptogame;
(function (cryptogame) {
    var SimpleCipher = (function () {
        function SimpleCipher(alphabet, options, random) {
            if (alphabet.letters.length == 0 || alphabet.substitutes.length == 0) {
                throw "alphabet is empty: " + alphabet;
            }
            if (alphabet.letters.length != alphabet.substitutes.length) {
                throw "Invalid alphabet, must have an equal amount of letters and substitutes: " + alphabet;
            }
            this.alphabet = alphabet;
            this.substituteSet = lincore.createSetOf(alphabet.substitutes);
            this.random = random || new lincore.Random();
            this.options = options || {};
            this.randomizeSubstitutes();
        }
        SimpleCipher.prototype.countLetters = function () {
            this.letterCounts = {};
            for (var i = 0; i < this.alphabet.substitutes.length; i++) {
                this.letterCounts[this.alphabet.substitutes[i]] = 0;
            }
            for (var i = 0; i < this.cipher.length; i++) {
                var letter = this.cipher[i];
                this.letterCounts[letter]++;
            }
            return this.letterCounts;
        };
        //TODO: handle alphabets with multi-character letters
        SimpleCipher.prototype.filter = function (ngram) {
            var _this = this;
            var ans = [];
            if (!ngram)
                return ans;
            var i = 0;
            var l = ngram.length;
            var match = function () {
                var j;
                for (j = 0; j < l; j++) {
                    var ch = ngram.charAt(j);
                    var subst = _this.cipher[i + j];
                    if (ch === '_' && !_this.substituteSet.hasOwnProperty(subst) ||
                        ch !== '_' && _this.cipher[i + j] !== ch) {
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
        };
        SimpleCipher.prototype.checkSolution = function (solution) {
            var unsolved = 0;
            for (var i = 0; i < this.alphabet.letters.length; i++) {
                var letter = this.alphabet.letters[i];
                var equal = this.dictionary[solution[letter]] === letter;
                if (this.letterCounts[letter] > 0 && !equal) {
                    if (solution[letter].match(/\S+/)) {
                        return false;
                    }
                    else {
                        unsolved++;
                    }
                }
            }
            return unsolved;
        };
        SimpleCipher.prototype.encode = function (msg) {
            msg = msg.toUpperCase();
            this.message = msg;
            this.cipher = [];
            var i = 0;
            while (i < msg.length) {
                var next = this.getNextLetter(msg, i);
                if (next !== null) {
                    this.cipher.push(next.letter);
                    i += next.length;
                }
                else {
                    var ch = this.message.charAt(i);
                    i++;
                    if (ch == " " && this.options["stripWhitespace"]) {
                        continue;
                    }
                    else if (this.alphabet.punctuation.indexOf(ch) != -1 &&
                        this.options["stripPunctuation"]) {
                        continue;
                    }
                    else {
                        this.cipher.push(ch);
                    }
                }
            }
            return this.cipher;
        };
        SimpleCipher.prototype.randomizeSubstitutes = function () {
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
        };
        SimpleCipher.prototype.getNextLetter = function (msg, index) {
            for (var len = this.maxLetterLength; len > 0; len--) {
                var s = msg.substr(index, len);
                if (this.dictionary[s] !== undefined) {
                    return { letter: this.dictionary[s], length: len };
                }
            }
            return null;
        };
        return SimpleCipher;
    })();
    cryptogame.SimpleCipher = SimpleCipher;
})(cryptogame || (cryptogame = {}));
/// <reference path="../definitions.ts"/>
var covertActionData = {
    name: "1990",
    description: "The world of covert action in 1990.",
    templates: {},
    alphabets: {},
    components: {},
    variables: {},
    theatres: {},
    makeQueryFunc: null
};
covertActionData.makeQueryFunc = function (theatreName, random) {
    var vars = {};
    theatreName = theatreName || random.pick1(Object.keys(covertActionData.theatres));
    var theatre = covertActionData.theatres[theatreName];
    var getVar = function (name) {
        if (name === "SNDORG" || name === "RCVORG") {
            var orgs = random.pick(theatre.organizations, 2);
            vars["SNDORG"] = orgs[0];
            vars["RCVORG"] = orgs[1];
        }
        else if (name === "SNDLOC" || name === "RCVLOC" || name === "SNDCOUNTRY" || name === "RCVCOUNTRY") {
            var locs = random.pick(theatre.locations, 2);
            vars["SNDLOC"] = locs[0][0];
            vars["SNDCOUNTRY"] = locs[0][1];
            vars["RCVLOC"] = locs[1][0];
            vars["RCVCOUNTRY"] = locs[1][1];
        }
        return vars[name];
    };
    return function (name, key) {
        if (name.charAt(0) == "$")
            name = name.substr(1);
        var v = vars[name];
        if (v === undefined) {
            v = covertActionData.variables[name];
            if (v !== undefined)
                v = random.pick1(v);
            else {
                v = getVar(name);
                if (v === undefined) {
                    return name;
                }
            }
        }
        if (key !== undefined && key !== null && typeof v === "object") {
            v = v[key];
        }
        return (typeof v === "string") ? v : "" + v;
    };
};
covertActionData.templates["full"] = [
    "message", "rcvorgref", "sndorgref", "rcvlocref", "sndlocref", "fluff"
];
covertActionData.alphabets["latin"] = {
    name: "Latin",
    punctuation: ".,;!?-_()",
    letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    substitutes: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
};
covertActionData.alphabets["en_latin+bigrams"] = {
    name: "Latin plus most common bigrams in the English language.",
    punctuation: covertActionData.alphabets["latin"].punctuation,
    letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "TH", "HE", "IN", "ER", "AN", "RE", "ND", "AT", "ON", "NT"],
    substitutes: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
};
/* more bigrams for later ;)
th 1.52       en 0.55       ng 0.18
he 1.28       ed 0.53       of 0.16
in 0.94       to 0.52       al 0.09
er 0.94       it 0.50       de 0.09
an 0.82       ou 0.50       se 0.08
re 0.68       ea 0.47       le 0.08
nd 0.63       hi 0.46       sa 0.06
at 0.59       is 0.46       si 0.05
on 0.57       or 0.43       ar 0.04
nt 0.56       ti 0.34       ve 0.04
ha 0.56       as 0.33       ra 0.04
es 0.56       te 0.27       ld 0.02
st 0.55       et 0.19       ur 0.02
*/
covertActionData.components["message"] = [
    "The political council has resolved to kidnap $VICTIM. " +
        "You are to find a suitable organization to carry out this mission. " +
        "I plan to personally arrange the appropriate financing.",
    "We request that you finance the kidnapping of $VICTIM. " +
        "Please deliver sufficient funds from our Bank of America " +
        "account to assure the success of our operation.",
    "We have selected your organization to carry out the kidnapping of $VICTIM. " +
        "Please make the necessary arrangements. " +
        "You will be paid handsomely for your efforts.",
    "Follow $VICTIM and determine when he is vulnerable. " +
        "When you have determined the best moment to strike, " +
        "inform our local operative.",
    "You are instructed to carry out the kidnapping of $VICTIM. " +
        "You will soon be informed of the time and place of the operation.",
    "Tomorrow at noon $VICTIM will be unguarded. " +
        "Recommend you make your escape via the alley.",
    "Our operation has been successfully completed. " +
        "Do not hesitate to call us again for additional operations.",
    "We request that you finance the assassination of $VICTIM. " +
        "Have your courier deliver the funds to our special operative.",
    "You are directed to purchase a high powered sniper rifle. " +
        "Deliver it to our special operative as soon as possible.",
    "Please provide details of $VICTIM's traveling schedule. " +
        "This operation is urgent and justifies risking your cover.",
    "$VICTIM is traveling unprotected on Thursday. " +
        "Suggest you follow him to determine best operational timing.",
    "$VICTIM is scheduled to be at location X at 12:00 am tomorrow. " +
        "You should have a clear shot from the apartment building across the street.",
    "A large quantity of $INGREDIENT is now ready for delivery. " +
        "Price as agreed on previous shipment.",
    "The drugs are packed in five kilo bags. " +
        "Normal chemical processing is required.",
    "We have received your latest drug order. " +
        "Our chemists will soon begin processing the raw base. " +
        "I expect payment without delay.",
    "A large quantity of chemicals is required for the latest drug shipment. " +
        "Deliver them to our primary lab without delay.",
    "The money is all here. It is a pleasure doing business with you.",
    "Here are the chemicals you required to process the drugs. " +
        "Time is of the essence.",
    "The drugs have been processed and purified. " +
        "They have been packed into two kilo bags.",
    "New drug shipment is expected shortly. " +
        "Please deliver the amount of one million dollars to our usual supplier.",
    "New drug consignment is being processed. " +
        "Pick up this shipment from the lab and deliver it to me.",
    "I shall be arriving with the drug shipment soon. " +
        "Assume you have arranged passage through customs inspection.",
    "The drugs are all here. " +
        "No problem with customs inspection thanks to our inside contact.",
    "We are interested in stealing $OBJECT from $BUILDING. " +
        "Your organization is noted for these activites and your assistance will be rewarded.",
    "Rumors indicate that $CIA_AGENT may be assisiting the CIA on this case. " +
        "This does not worry me in the least.",
    "You are to acquire the floor plan blueprints of $BUILDING needed for our operation. " +
        "Deliver them to our special operative.",
    "Here are the blueprints for $BUILDING. There appears to be at least one unguarded " +
        "entry point. However, there is a sophisticated alarm system.",
    "It is vital that you provide us details of the security alarm at $BUILDING. " +
        "Use your inside connections if necessary.",
    "The alarm system at $BUILDING is a Beta model Hughes ElectroMaster. " +
        "This months access code word is ROSEBUD.",
    "This bypass box I built should disable the alarm system at $BUILDING. " +
        "Be sure not to confuse the red and yellow wires.",
    "We need you to build an alarm bypass box for our current operation. " +
        "A courier is standing by to deliver the box.",
    "The $BUILDING has a new motion sensitive LockTronic alarm system which guards all entrances. " +
        "I think an ultra high frequency beam might disable it.",
    "Photographs of the $OBJECT you requested have been taken. " +
        "Forwarding them to the Mastermind via courier.",
    "To achieve our goals it has become necessary to destroy the $BUILDING. " +
        "We ask you to organize this operation. Your assistance will be rewarded.",
    "You are to acquire the floor plan blueprints of $BUILDING needed for our operation. " +
        "Deliver them to the bomb placement team.",
    "It is vital that you provide us with a large quantity of plastic explosives. " +
        "Deliver to our bomb expert as soon as possible.",
    "The alarm system at $BUILDING is a Alpha model Hughes ProtectoMaster. " +
        "I recommend an electronic detonator for this job.",
    "To further our plans we must access a data file containing $VICTIM. " +
        "Please help finance these arrangements.",
    "You are instructed to acquire current passwords for the $BUILDING computer network. " +
        "A courier will arrive shortly to pick up this information.",
    "You must access data files on the $BUILDING computer network. " +
        "Appropriate passwords will be delivered to you.",
    "Your services are required to perform a financial delivery. " +
        "Bring a black leather briefcase.",
    "The time has come to strike $BUILDING. " +
        "You are instructed to employ mercenaries for this operation.",
    "The time has come to strike $VICTIM. " +
        "You are instructed to employ mercenaries for this operation.",
    "I have received strike orders from the controller. " +
        "You will furnish our operatives with unregistered weapons.",
    "This is an activation order, mission code ALPHA. " +
        "Unregistered weapons will be provided. " +
        "Your target is $BUILDING.",
    "This is an activation order, mission code ALPHA. " +
        "Unregistered weapons will be provided. " +
        "Your target is $VICTIM.",
    "We need a good man to handle transportation. " +
        "An all terrain vehicle will be provided.",
    "Deliver an unmarked all terrain vehicle to our transport man.",
    "Vehicle received in good order. Awaiting your attack signal.",
    "Our plan now requires a perfect imitation of $OBJECT. " +
        "This will be expensive, so tap the special account.",
    "We have a job for you. I hope your lockpicks are in order. " +
        "A sample $OBJECT is required. Acquire one and report to the paymaster.",
    "The $OBJECT has been acquired. Awaiting further instructions and payment.",
    "You are required to make a sensitive delivery. Bring a wrist cuffed briefcase.",
    "You are to pick up a $OBJECT and deliver it to our special operative.",
    "Apply your special talents to this item. A perfect duplicate is required. " +
        "We will make it worth your while.",
    "It is vital that we extract $PRISONER from prison. You must help me with the escape plans.",
    "Send us information regarding the layout and schedules at the local prison. " +
        "You will be paid handsomely for this vital information.",
    "You may prove your dedication to the cause by kidnapping an experienced helicopter pilot. " +
        "Deliver him to The Extractor.",
    "Your special talents are required to free $PRISONER from prison. " +
        "A helicopter pilot and inside intelligence will be supplied.",
    "I have convinced the pilot to be cooperative. He has experience with a wide " +
        "variety of choppers.",
    "There is a large courtyard in the prison suitable for a helicopter extraction. " +
        "$PRISONER is allowed in the courtyard for exercise periods.",
    "It is time to bring $VICTIM under our control. " +
        "You are to arrange a meeting with the lovely agent known as the Black Widow.",
    "We are planning to lure $VICTIM into a compromising situation. " +
        "Find a suitable location and arrange for photo and video coverage.",
    "We will have the photographs you need shortly. " +
        "I am sure $VICTIM will not be able to resist your threats.",
    "Your special charms will be needed to seduce $VICTIM. " +
        "This case should be a piece of cake.",
    "$VICTIM's wife is named Laverne and is reported to be extremely jealous. " +
        "He should crack in no time.",
    "Preparations are being make to produce $PRODUCT. We will require $INGREDIENT. " +
        "Obtain the necessary funds and deliver them to the Procurer.",
    "Some special supplies will be required to produce $PRODUCT. " +
        "Steal or buy them and deliver them to our manufacturing facility.",
    "Your assignment is to acquire $INGREDIENT. " +
        "Sufficient funds will be supplied to you as soon as possible.",
    "I was able to put my hands on the supplies you wanted. " +
        "The $INGREDIENT should be delivered shortly.",
    "These instructions come from the highest levels of the $SNDORG. " +
        "Prepare a facility for the manufacture of $PRODUCT. " +
        "All details will be taken care of.",
    "The $PRODUCT appear to be of high quality. " +
        "The orders of $RCVORG high command have been fulfilled."
];
covertActionData.components["sndorgref"] = [
    "This operation has the approval of $SNDORG high command.",
    "The $SNDORG political program requires total cooperation.",
    "The $SNDORG is ready for action.",
    "$SNDORG is ready to reward you for your success.",
    "Regards from your brothers in the $SNDORG.",
    "We of the $SNDORG commend your excellent work.",
    "Those who serve the $SNDORG are well rewarded.",
    "Your success assures the goodwill of the $SNDORG."
];
covertActionData.components["rcvorgref"] = [
    "Salutations to our loyal comrades of the $RCVORG.",
    "Fellow warriors of the $RCVORG now is the time for action.",
    "We welcome cooperation with the $RCVORG.",
    "Thanks for your assistance $RCVORG.",
    "Dedicated brethren of the $RCVORG we salute you.",
    "All glory to our steadfast allies of the $RCVORG.",
    "We note the heroic actions of the $RCVORG.",
    "Victory to our colleagues in the $RCVORG."
];
covertActionData.components["sndlocref"] = [
    "Greetings from $SNDLOC.",
    "Having a wonderful time in $SNDLOC wish you were here.",
    "Enemy activity in $SNDLOC has been moderate.",
    "Our recruiting in $SNDLOC has been quite successful.",
    "The struggle in $SNDLOC advances from triumph to victory.",
    "All $SNDLOC echoes with praise of your successes.",
    "Even here in $SNDLOC your efforts are noted.",
    "Our project here in $SNDLOC proceeds on schedule."
];
covertActionData.components["rcvlocref"] = [
    "I am planning to visit $RCVLOC shortly.",
    "How is $RCVLOC this time of year.",
    "Send us details of your activities in $RCVLOC.",
    "Take precautions $RCVLOC is dangerous.",
    "All true comrades admire your work in $RCVLOC.",
    "We are aware of your current situation in $RCVLOC.",
    "With you in $RCVLOC our cause cannot fail.",
    "We are confident your work in $RCVLOC will continue on schedule."
];
covertActionData.components["fluff"] = [
    "Our sympathizers can be found everywhere.",
    "Our power increases with each passing day.",
    "Beware of false friends.",
    "Our enemies are on the verge of collapse.",
    "Time is of the essence.",
    "Deviations from this plan are not acceptable.",
    "Your support is essential in this operation.",
    "Extreme measures may be called for.",
    "Destiny is our ally.",
    "Remember who you are dealing with here.",
    "None doubt your loyalty.",
    "Some aspects of the situation remain unclear.",
    "Extreme caution is advised. Message security must be maintained.",
    "Do not hesitate to act in a decisive manner.",
    "Your request for promotion is being considered.",
    "Further communications may follow."
];
covertActionData.components["alert"] = [
    "We have no indications of enemy activity at this time.",
    "It seems someone is looking into our activities.",
    "The CIA is definately on our trail.",
    "Warning the CIA is in hot pursuit of our agents.",
    "We must deal with the CIA agent who is pursuing us."
];
covertActionData.components["aid"] = [
    "$HLPORG may be assisting in this operation.",
    "We also plan to use $HLPORG agents on this project."
];
covertActionData.variables["VICTIM"] = [
    "The Prison warden",
    "The Secretary of State",
    "The President",
    "The CIA Director",
    "Walter Simmons",
];
covertActionData.variables["PRISONER"] = [
    "Willie the Pen",
    "One Eyed Jack",
    "Tricia McMillen"
];
covertActionData.variables["BUILDING"] = [
    "a large industrial warehouse",
    "state penetentiary",
    "state treasury",
];
covertActionData.variables["OBJECT"] = [
    "alarm bypass",
    "floor plan blueprints",
    "key",
    "explosives"
];
covertActionData.variables["CIA_AGENT"] = [
    "Max Remington",
    "Maxine Remington",
    "Max Power",
];
covertActionData.variables["INGREDIENT"] = [
    "raw cocaine base",
    "electronic components",
    "sniper components",
];
covertActionData.theatres["europe"] = {
    organizations: [
        "Direct Action",
        "PIFA",
        "Red Army",
        "Red Battalion",
        "PFO",
        "Mafia",
        "UnionCorsique",
        "Iraqi SP",
        "KGB",
        "Libyan Embassy",
        "Marxists",
        "StaSi"
    ],
    "locations": [
        ["Washington", "USA"],
        ["Amsterdam", "The Netherlands"],
        ["Athens", "Greece"],
        ["Belgrade", "Yugoslavia"],
        ["Berlin", "Germany"],
        ["Budapest", "Hungary"],
        ["Geneva", "Switzerland"],
        ["Helsinki", "Finland"],
        ["London", "England"],
        ["Madrid", "Spain"],
        ["Moscow", "USSR"],
        ["Paris", "France"],
        ["Prague", "Czech Republic"],
        ["Rome", "Italy"],
        ["Tel Aviv", "Israel"],
        ["Vienna", "Austria"]
    ]
};
covertActionData.theatres["africa"] = {
    "organizations": [
        "Libyan Embassy",
        "Iraqi SP",
        "Mercenaries",
        "Marxists",
        "KGB",
        "Red Battalion",
        "PFO",
        "Muslim Jihad",
        "PRC",
        "Red September",
        "Revolutionary Guards",
        "StaSi"
    ],
    "locations": [
        ["Washington", "USA"],
        ["Amman", "Jordan"],
        ["Athens", "Greece"],
        ["Baghdad", "Iraq"],
        ["Beirut", "Lebanon"],
        ["Cairo", "Egypt"],
        ["Damascus", "Syria"],
        ["Istanbul", "Turkey"],
        ["Khartoum", "The Sudan"],
        ["London", "England"],
        ["Paris", "France"],
        ["Riyadh", "Saudi Arabia"],
        ["Rome", "Italy"],
        ["Tehran", "Iran"],
        ["Tel Aviv", "Israel"],
        ["Tripoli", "Libya"]
    ]
};
covertActionData.theatres["america"] = {
    "organizations": [
        "Mafia",
        "Mercenaries",
        "Amazon Cartel",
        "Colombian Cartel",
        "Death Squads",
        "Dignity Battalion",
        "FLN",
        "Haitian Junta",
        "Jamaican Gang",
        "M18",
        "Shining Way",
        "Tupamaros"
    ],
    "locations": [
        ["Washington", "USA"],
        ["Bogota", "Columbia"],
        ["Caracas", "Venezuela"],
        ["Havana", "Cuba"],
        ["Kingston", "Jamaica"],
        ["London", "England"],
        ["Los Angeles", "USA"],
        ["Managua", "Nicaragua"],
        ["Medellin", "Columbia"],
        ["Mexico City", "Mexico"],
        ["Miami", "USA"],
        ["Nassau", "The Bahamas"],
        ["Panama", "Panama"],
        ["Rio de Janeiro", "Brazil"],
        ["Juan", "Puerto Rico"],
        ["Tel Aviv", "Israel"]
    ]
};
/// <reference path="util/random.ts"/>
/// <reference path="util/param.ts"/>
/// <reference path="util/util.ts"/>
/// <reference path="cipher_simple.ts"/>
/// <reference path="composer.ts"/>
/// <reference path="data/covert_data.ts"/>
var cryptogame;
(function (cryptogame) {
    var GameLogic = (function () {
        function GameLogic(params, data, difficulties) {
            this.params = params;
            this.datasets = data;
            this.difficulties = difficulties;
            this.difficulty = difficulties[params.getInt("difficulty", 0)];
            this.random = new lincore.Random(params.getInt("seed"));
            this.composer = new cryptogame.MessageComposer(this.random);
        }
        GameLogic.prototype.newGame = function () {
            this.createMessage();
            this.createCipher();
            this.translation = {};
            var len = this.alphabet.substitutes.length;
            for (var i = 0; i < len; i++) {
                this.translation[this.alphabet.substitutes[i]] = "";
            }
            if (this.onNewGame)
                this.onNewGame(this);
            if (this.onTranslChange)
                this.onTranslChange(this);
        };
        GameLogic.prototype.addTranslation = function (subst, transl) {
            transl = transl || "";
            if (this.translation[subst] != transl) {
                this.translation[subst] = transl;
                return true;
            }
            return false;
        };
        GameLogic.prototype.isGameWon = function () {
            var missing = this.cipher.checkSolution(this.translation);
            return missing !== false && missing < 2;
        };
        GameLogic.prototype.hasSubstitute = function (subst) {
            return this.cipher.alphabet.substitutes.indexOf(subst) != -1;
        };
        GameLogic.prototype.hasLetter = function (letter) {
            return this.cipher.alphabet.letters.indexOf(letter) != -1;
        };
        GameLogic.prototype.createMessage = function () {
            var key = this.params.get("db", "default");
            this.db = this.datasets[key];
            var theatre = this.params.get("theatre");
            var template = this.params.get("template");
            this.message = this.composer.compose(this.db, template, theatre);
        };
        GameLogic.prototype.createCipher = function () {
            this.alphabet = this.db.alphabets[this.params.get("alphabet", "latin")];
            this.cipher = new cryptogame.SimpleCipher(this.alphabet, this.difficulty);
            this.cipher.encode(this.message);
            this.cipher.countLetters();
        };
        return GameLogic;
    })();
    cryptogame.GameLogic = GameLogic;
})(cryptogame || (cryptogame = {}));
var cryptogame;
(function (cryptogame) {
    var GameView = (function () {
        function GameView(params) {
            this.printer = new HtmlPrinter(params.getInt("width"));
            this.params = params;
        }
        GameView.prototype.init = function () {
            $(".noscript").addClass("hidden");
            $("#game_wrapper").removeClass("hidden");
            this.messageElem = $("div#cipher_message");
            this.dictElem = $("div#dict_content");
            this.timerElem = $("#timer");
            this.msgIdElem = $("span#msg_id");
            this.tryAnotherElem = $("#try_another");
            this.winDlgElem = $("#win_dlg");
        };
        GameView.prototype.setMark = function (m, cipher, translation) {
            this.mark = m;
            this.print(cipher, translation);
        };
        GameView.prototype.getTimerFunc = function () {
            var instance = this;
            return function () {
                instance.timePassed += 1;
                var secs = instance.timePassed % 60;
                var mins = Math.floor(instance.timePassed / 60);
                var secstr = lincore.padLeft(mins.toString(), 2, "0");
                var minstr = lincore.padLeft(secs.toString(), 2, "0");
                instance.timerElem.text(secstr + ":" + minstr);
            };
        };
        GameView.prototype.print = function (cipher, translation) {
            this.messageElem.html(this.printer.printMessage(cipher, translation, this.mark));
            this.dictElem.html(this.printer.printDictionary(cipher, translation));
        };
        GameView.prototype.showWinState = function () {
            clearInterval(this.timerHandle);
            this.tryAnotherElem.html("<a href=\"javascript:game.play();\">TRY ANOTHER?</a>");
            this.winDlgElem.removeClass("hidden");
        };
        GameView.prototype.newGame = function (seed, msgLength) {
            this.timePassed = 0;
            this.timerHandle = setInterval(this.getTimerFunc(), 1000);
            this.winDlgElem.addClass("hidden");
            var p = new lincore.Parameters(lincore.flatcopy(this.params.dict));
            p.dict["seed"] = "" + seed;
            console.log(p);
            var url = lincore.getUrlPart(window.location.href);
            this.msgIdElem.html("<a href=\"" + url + "/" + p.toSearchString() + "\" title=\"link to this cipher\">" + seed + "</a>,\n                 Len:" + msgLength);
        };
        return GameView;
    })();
    cryptogame.GameView = GameView;
    var HtmlPrinter = (function () {
        function HtmlPrinter(lineWidth) {
            this.n = 0;
            this.letters = {};
            this.substitutes = {};
            this.lineWidth = lineWidth || 42;
        }
        HtmlPrinter.prototype.printDictionary = function (cipher, playerSubsts) {
            // row: subst, letter, count
            var output = [];
            for (var i = 0; i < cipher.alphabet.letters.length; i++) {
                var letter = cipher.alphabet.letters[i];
                var s1 = playerSubsts[cipher.alphabet.letters[i]] || "";
                s1 = lincore.padRight(s1, cipher.maxLetterLength);
                var s2 = cipher.alphabet.substitutes[i];
                var count = cipher.letterCounts[letter];
                output.push("<div class=\"cipher_dict_row\">\n                        <div class=\"cipher_dict_transl\">" + s1 + "</div>\n                        <div class=\"cipher_dict_subst\">" + s2 + "</div>\n                        <div class=\"cipher_dict_count\">" + count + "</div>\n                    </div>");
            }
            return output.join("");
        };
        HtmlPrinter.prototype.printMessage = function (cipher, playerSubsts, mark) {
            this.mark = mark || [];
            this.cipher = cipher;
            this.letters = cipher.alphabet.letters;
            this.substitutes = cipher.substituteSet;
            this.n = 0;
            var output = [];
            for (var i = 0; i < cipher.cipher.length; i += this.lineWidth) {
                output.push('<div class="cipher_msg_row">');
                this.printLetterRow(this.cipher.cipher, i, output);
                this.printSubstRow(this.cipher.cipher, playerSubsts, i, output);
                output.push('</div>');
            }
            return output.join("");
        };
        HtmlPrinter.prototype.printCipherLetter = function (letter, index, output) {
            var clazz = cryptogame.HTML.CIPHER_MSG_LETTER;
            var dataAttrib = "";
            if (letter !== " " || this.cipher.alphabet.punctuation.indexOf(letter) != -1) {
                clazz += " in_alphabet";
                dataAttrib = "data-letter=\"" + letter + "\"";
            }
            if (this.mark[index]) {
                clazz += " marked";
            }
            output.push("<span class=\"" + clazz + "\" " + dataAttrib + ">" + letter + "</span>");
        };
        HtmlPrinter.prototype.isLetter = function (str) {
            return this.letters[str] !== undefined;
        };
        HtmlPrinter.prototype.isSubstitute = function (str) {
            return this.substitutes[str] !== undefined;
        };
        HtmlPrinter.prototype.printCipherSubst = function (subst, output) {
            var out;
            if (subst) {
                out = "<span class=\"" + cryptogame.HTML.CIPHER_MSG_SUBST + " in_alphabet\" data-subst=\"" + subst + " \">" + subst + "</span>";
            }
            else {
                out = "<span class=\"" + cryptogame.HTML.CIPHER_MSG_SUBST + "\"> </span>";
            }
            output.push(out);
        };
        HtmlPrinter.prototype.printLetterRow = function (msg, offset, output) {
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
        };
        HtmlPrinter.prototype.printSubstRow = function (msg, playerSubsts, offset, output) {
            output.push('<div class="cipher_msg_subst_row">');
            var max = Math.min(offset + this.lineWidth, msg.length);
            for (var i = offset; i < max; i++) {
                this.printCipherSubst(playerSubsts[msg[i]], output);
            }
            output.push('</div>\n');
        };
        return HtmlPrinter;
    })();
    cryptogame.HtmlPrinter = HtmlPrinter;
})(cryptogame || (cryptogame = {}));
///<reference path="jquery.d.ts" />
///<reference path="game_logic.ts" />
///<reference path="game_view.ts" />
var game;
$(function () {
    game = new cryptogame.GameController();
    game.init();
    game.play();
});
var cryptogame;
(function (cryptogame) {
    var GameController = (function () {
        function GameController() {
            this.datasets = {
                "covert_action": covertActionData,
                "default": covertActionData
            };
            this.difficulties = [
                {},
                { stripPunctuation: true },
                { stripWhitespace: true },
                { stripPunctuation: true, stripWhitespace: true }
            ];
            this.params = new lincore.Parameters(document.location.search);
            this.logic = new cryptogame.GameLogic(this.params, this.datasets, this.difficulties);
            this.view = new cryptogame.GameView(this.params);
            this.ngramFilter = "";
        }
        GameController.prototype.init = function () {
            this.ngramInput = $('input[name="ngram_input"]');
            this.view.init();
            this.setupHooks();
        };
        GameController.prototype.win = function () {
            this.params.remove("seed");
            var transl = lincore.getInvertedKvs(this.logic.cipher.dictionary);
            this.view.print(this.logic.cipher, transl);
            this.view.showWinState();
        };
        GameController.prototype.addTranslation = function (subst, transl) {
            transl = transl == " " ? undefined : transl;
            if (this.logic.addTranslation(subst, transl)) {
                if (this.logic.isGameWon()) {
                    this.win();
                }
                else {
                    this.view.print(this.logic.cipher, this.logic.translation);
                }
            }
        };
        GameController.prototype.onLetterSelect = function (letter) {
            if (this.enteredSubst) {
                $(".cipher_dict_subst:contains(\"" + this.enteredSubst + "\")").removeClass("blink");
                if (letter == " " || letter && this.logic.hasSubstitute(letter)) {
                    this.addTranslation(this.enteredSubst, letter);
                }
                this.enteredSubst = "";
            }
            else if (letter && this.logic.hasLetter(letter)) {
                this.enteredSubst = letter;
                $(".cipher_dict_subst:contains(\"" + letter + "\")").addClass("blink");
            }
        };
        GameController.prototype.setFilter = function (filter) {
            filter = filter.toLocaleUpperCase();
            if (filter !== this.ngramFilter) {
                this.ngramFilter = filter;
                var mark = this.logic.cipher.filter(filter);
                this.view.setMark(mark, this.logic.cipher, this.logic.translation);
            }
        };
        GameController.prototype.setupHooks = function () {
            var _this = this;
            var inst = this;
            $("html").keyup(function (event) {
                if (!$(document.activeElement).is("body"))
                    return;
                var ch = String.fromCharCode(event.which).toUpperCase();
                inst.onLetterSelect(ch);
            });
            $(this.ngramInput).bind("change paste keyup", function (event) {
                if (event.which === 27) {
                    _this.ngramInput.val("");
                    _this.ngramInput.get(0).blur();
                }
                else if (event.which === 13) {
                    _this.ngramInput.get(0).blur();
                    return;
                }
                inst.setFilter(_this.ngramInput.val());
            });
        };
        GameController.prototype.play = function () {
            var seed = this.logic.random.seed;
            this.logic.newGame();
            this.view.newGame(seed, this.logic.cipher.message.length);
            this.view.print(this.logic.cipher, this.logic.translation);
        };
        return GameController;
    })();
    cryptogame.GameController = GameController;
})(cryptogame || (cryptogame = {}));
//# sourceMappingURL=out.js.map