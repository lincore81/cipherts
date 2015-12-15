///<require path="definitions.ts" />
///<require path="util/param.ts" />

module cryptogame.settings {
    export var params: lincore.Parameters;    

    export function init(searchstr: string) {
        loadLocalStorage();
        console.log(params.dict);
        params.setAllIn(new lincore.Parameters(searchstr));
    }

    export function loadLocalStorage() {
        if (!window.localStorage) {
            console.log("local storage not available, can not load.");
            params = new lincore.Parameters();
            return;
        }
        var json = <string>window.localStorage.getItem("settings");
        params = lincore.Parameters.fromJson(json);
    }

    export function saveToLocalStorage() {
        if (!window.localStorage) {
            console.log("local storage not available, can not load.");
            return;
        }
        var clone = params.clone("seed");
        window.localStorage.setItem("settings", clone.toJson());
    }

    export function setDifficulty(difficulty: Difficulty) {
        params.set("difficulty", ""+difficulty.id);
    }
}