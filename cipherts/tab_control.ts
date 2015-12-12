///<reference path="jquery.d.ts" />

module lincore {
    function asJQuery(arg: string | JQuery, container ?: JQuery): JQuery {
        var isString = typeof arg === "string" || arg instanceof String;
        if (isString) {
            return container ? container.children(<string>arg) : $(<string>arg);
        } else {
            return <JQuery>arg;
        }
    }

    export class TabControl {

        // css class used to hide contents of unselected tabs
        private hiddenCssClass: string;
        
        // css class for highlighting the currently selected tab
        private selectedCssClass: string;
        
        // class applied to all tabs when TabControl instance has been initialized.
        // Enables alternative layout options when js is not available.
        private tabControlCssClass: string;

        private tabs: JQuery;
        private contents: JQuery;
        private TAB_ATTRIB = "data-tab";
        private selectedTab: JQuery;

        onTabSelectCallback: (tab: JQuery, content: JQuery) => void;
        onTabDeselectCallback: (tab: JQuery, content: JQuery) => void;

        constructor(tabs: (string | JQuery), content: (string | JQuery), container?: (string | JQuery),
            hiddenCssClass = "hidden", selectedCssClass = "selected", tabControlCssClass = "tab_controlled")
        {
            container = container? asJQuery(container) : undefined;
            this.tabs = asJQuery(tabs, <JQuery>container);
            this.contents = asJQuery(content, <JQuery>container);
            this.selectedTab = null;

            this.hiddenCssClass = hiddenCssClass;
            this.selectedCssClass = selectedCssClass;
            this.tabControlCssClass = tabControlCssClass;

            if (this.tabs.length !== this.contents.length) {
                console.warn("TabControl: number of tabs differs from number of contents, ignoring surplus.");
                var len = Math.min(this.tabs.length, this.contents.length);
                if (this.tabs.length > len) {
                    this.tabs = this.tabs.slice(0, len);
                } else {
                    this.contents = this.contents.slice(0, len);
                }
            }
        }

        init(initialTab?: string | number, selectionEvents = "click", deselectionEvents?: string) {
            var i;
            var len = Math.min(this.tabs.length, this.contents.length);
            for (i = 0; i < len; i++) {
                var tab = this.tabs[i];
                tab.setAttribute(this.TAB_ATTRIB, "" + i);
                var content = this.contents[i];
                content.setAttribute(this.TAB_ATTRIB, "" + i);
            }
            this.tabs.bind(selectionEvents, this, TabControl.onTabSelect);
            if (deselectionEvents) {
                this.tabs.bind(deselectionEvents, this, TabControl.onTabDeselect);
            }
            this.deselect();
            if (initialTab !== undefined) this.select(initialTab || 0);
        }

        count(): number {
            return this.tabs.length;
        }

        private getContent(tab: JQuery): JQuery {
            var id = parseInt(tab.attr(this.TAB_ATTRIB));            
            return (id != NaN) ? $(this.contents[id]) : null;
        }

        deselect() {
            if (this.selectedTab && this.onTabDeselectCallback) {
                var content = this.getContent(this.selectedTab);
                this.onTabDeselectCallback(this.selectedTab, content);
            }
            this.tabs.removeClass(this.selectedCssClass);
            this.contents.addClass(this.hiddenCssClass);
            this.selectedTab = null;
        }

        select(selector: string | number) {
            var tab: JQuery;
            var isString = typeof selector === "string" || <any>selector instanceof String;
            if (isString) {
                tab = this.tabs.filter(<string>selector);
            } else {
                tab = $(this.tabs[<number>selector]);
            }
            this.selectElement(tab);
        }

        selectElement(tab: JQuery) {
            if (this.selectedTab) {
                var isSelectedTab = tab.attr(this.TAB_ATTRIB) === this.selectedTab.attr(this.TAB_ATTRIB);
                if (isSelectedTab) return;
            }
            var content = this.getContent(tab);
            console.assert(content !== null, "no content for tab: " + tab);
            this.deselect();
            tab.addClass(this.selectedCssClass);
            content.removeClass(this.hiddenCssClass);
            this.selectedTab = tab;
            if (this.onTabSelectCallback) {
                this.onTabSelectCallback(tab, content);
            }
        }        


        private static onTabSelect(event: JQueryEventObject) {
            var instance = <TabControl>event.data;
            instance.selectElement($(event.target));
        }

        private static onTabDeselect(event: JQueryEventObject) {
            var instance = <TabControl>event.data;
            instance.deselect();
        }
    }
}