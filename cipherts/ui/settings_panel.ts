module cryptogame.ui {
    export class SettingsPanel {
        private printDifficultySettings(data: GameDatabase, output: string[]) {
            var currentDiff = settings.params.getInt("difficulty", 0);
            for (var i = 0, len = data.difficulties.length; i < len; i++) {
                var diff = data.difficulties[i];
                var selected = currentDiff === diff.id;
                output.push(
                    `<div>
                        <input type="radio" name="difficulty" id="diff${i}"
                            value="${i}"${selected ? ' checked="checked"' : " "}>
                        <label for="diff${i}">${diff.name}</label>
                        <span class="description">${diff.desc}</span>
                    </div>`);
            }
        }

        print(data: GameDatabase, $elem: JQuery, callback: (key: string, val: string) => void) {
            var diff = <string[]>[];
            this.printDifficultySettings(data, diff);
            $elem.html(`
                <form class="settings_form" action="javascript:void(0)">
                    <button id="new_game_btn">Start a new Game</button>                    
                    
                    <div class="expandable_head" id="settings_difficulty_head">
                        Difficulty
                    </div>
                    <div class="expandable" data-head="div#settings_difficulty_head">
                        ${diff.join("\n")}
                    </div>
                </form>`);
            var diffRadioBtns = $elem.find(`input:radio[name=difficulty]`);
            diffRadioBtns.change((event) => {
                var val = $('input:radio[name=difficulty]:checked').val();
                callback("difficulty", ""+val);
            });
            $("button#new_game_btn").click((event) => callback("new game", "true"));
            //var expandables = $(".expandable");
            //expandables.slideToggle(0);
            //lincore.makeAllExpandable(expandables);
        }
    }
}