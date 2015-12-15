/// <reference path="../definitions.ts"/>

var covertActionData: cryptogame.GameDatabase = {
    name: "1990",
    description: "The world of covert action in 1990.",
    templates: {},
    alphabets: {},
    components: {},
    variables: {},
    theatres: {},
    difficulties: null,
    makeQueryFunc: null
}

covertActionData.makeQueryFunc = (theatreName?: string, random?: lincore.Random) => {
    var vars = {};
    theatreName = theatreName || random.pick1(Object.keys(covertActionData.theatres));
    var theatre = covertActionData.theatres[theatreName];
    var getVar = (name: string) => {
        if (name === "SNDORG" || name === "RCVORG") {
            var orgs = random.pick(theatre.organizations, 2);
            vars["SNDORG"] = orgs[0];
            vars["RCVORG"] = orgs[1];
        } else if (name === "SNDLOC" || name === "RCVLOC" || name === "SNDCOUNTRY" || name === "RCVCOUNTRY") {
            var locs = random.pick(theatre.locations, 2);
            vars["SNDLOC"] = locs[0][0];
            vars["SNDCOUNTRY"] = locs[0][1];
            vars["RCVLOC"] = locs[1][0];
            vars["RCVCOUNTRY"] = locs[1][1];
        }
        return vars[name];
    }
    return (name: string, key?: string | number): string => {
        if (name.charAt(0) == "$") name = name.substr(1);
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
    }
}

covertActionData.difficulties = [
    {
        name: "Very easy",
        desc: "whitespace, punctuation, single character letters",
        id: 0,
        options: {}
    }, {
        name: "Easy",
        desc: "whitespace, no punctuation, single character letters",
        id: 1,
        options: { stripPunctuation: true }
    }, {
        name: "Moderate",
        desc: "no whitespace, punctuation, single character letters",
        id: 2,
        options: { stripWhitespace: true }
    }, {
        name: "Challenging",
        desc: "no whitespace, no punctuation, single character letters",
        id: 3,
        options: { stripPunctuation: true, stripWhitespace: true }
    }, {
        name: "Very challenging",
        desc: "whitespace, punctuation, single character letters and most common digrams (multi-character letters can not be typed with keyboard atm, use the mouse instead)",
        id: 4,
        options: { alphabet: "en_latin_bigrams" }
    }, {
        name: "Barely possible",
        desc: "no whitespace, no punctuation, single character letters and most common digrams (multi-character letters can not be typed with keyboard atm, use the mouse instead)",
        id: 5,
        options: {
            alphabet: "en_latin_bigrams",
            stripWhitespace: true,
            stripPunctuation: true
        }
    }
];

covertActionData.templates["full"] = [
    "message", "rcvorgref", "sndorgref", "rcvlocref", "sndlocref", "fluff"
];

covertActionData.alphabets["latin"] = {
    name: "Latin",
    punctuation: ".,;!?-_()",
    letters:
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    substitutes:
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
};

covertActionData.alphabets["default"] = covertActionData.alphabets["latin"];

covertActionData.alphabets["en_latin_bigrams"] = {
    name: "Latin plus most common bigrams in the English language.",
    punctuation: covertActionData.alphabets["latin"].punctuation,
    letters:
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "TH", "HE", "IN", "ER", "AN", "RE", "ND", "AT", "ON", "NT"],

    substitutes:
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "$0", "$1", "$2", "$3", "$4", "$5", "$6", "$7", "$8", "$9"]
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
    "raw cocaine base",  //["raw cocaine base", "cocaine"],
    "electronic components", //"alarm bypass"],
    "sniper components", //"rifle"],
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