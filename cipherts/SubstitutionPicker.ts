module cryptogame {
    export class SubstitutionPickerDlg {
        pickerDlgModal: JQuery;
        pickerDlgLetters: JQuery;
        pickerDlgSubst: JQuery;
        pickCallback: (subst: string, transl: string) => void;
        private visible: boolean;
        private currentSubst: string;

        isVisible() {
            return this.visible;
        }

        init() {
            this.pickerDlgModal = $("#char_picker_modal_bg");
            this.pickerDlgLetters = $("#char_picker_letters");
            this.pickerDlgSubst = $("#char_picker_subst");
            this.pickerDlgModal.click(this, SubstitutionPickerDlg.clickHandler);
            this.visible = false;
        }

        private static clickHandler(event) {
            var self = <SubstitutionPickerDlg>event.data;
            var target = $(event.target);
            if (target.hasClass("char_picker_letter")) {
                var letter = target.attr("data-letter");
                if (self.pickCallback) self.pickCallback(self.currentSubst, letter);
            } else if (target.is("#char_picker_close") || target.is("#char_picker_modal_bg")) {
                self.hide();
            }
        }

        populate(letters: string[], pickCallback: (subst: string, transl: string) => void) {
            var output: string[] = [];
            for (var i = 0, len = letters.length; i < len; i++) {
                var letter = letters[i];
                output.push(`<span class="char_picker_letter"
                        data-letter="${letter}">${letter}</span> `);
            }
            output.push('<span class="char_picker_letter" data-letter=" ">Clear</span>');
            this.pickerDlgLetters.html(output.join(""));
            this.pickCallback = pickCallback;            
        }

        show(subst: string) {
            if (!this.visible) {
                this.pickerDlgModal.removeClass("hidden");
                this.pickerDlgSubst.text(subst);
                this.currentSubst = subst;
                this.visible = true;
            }
        }

        hide() {
            if (this.visible) {
                this.pickerDlgModal.addClass("hidden");
                this.visible = false;
            }

        }
    }
}
