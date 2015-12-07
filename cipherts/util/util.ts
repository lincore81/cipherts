module lincore {
    var searchRegex = /\??(\w+)=(\w+)(?:\&)?/g;

    export function Set(arry: any[]): any {
        var ans = {}
        for (var i = 0; i < arry.length; i++) {
            ans[arry[i]] = true;
        }
        return ans;
    }

    export function getInvertedKvs(obj: {}): {} {
        var keys = Object.keys(obj);
        var ans = {};
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            ans[obj[key]] = key;
        }
        return ans;
    }

    
    export function flatcopy(obj: {}): {} {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    export function parseSearchString(str: string) {
        //format: "?key1=value1&key2=value2&...&keyN=valueN"
        var dict: Dict<string> = {};
        str.replace(searchRegex, (match: string, key: string, value: string) => {
            dict[key] = value;
            return match;
        });
        return dict;

    }

    export function getUrlPart(str: string): string {
        str = str.replace(searchRegex, "");
        if (str.charAt(str.length - 1) == "/") 
            str = str.substring(0, str.length - 1);
        return str;
    }

    export function strRepeat(str: string, times: number) {
        return Array(times + 1).join(str);
    }

    export function padLeft(str: string, len: number, padding = " ") {
        var plen = len - str.length;
        if (plen <= 0) return str;
        return strRepeat(padding, plen) + str;
    }

    export function padRight(str: string, len: number, padding = " ") {
        var plen = len - str.length;
        if (plen <= 0) return str;
        return str + strRepeat(padding, plen);
    }

    export function getNextNode(node) {
        if (node.firstChild)
            return node.firstChild;
        while (node) {
            if (node.nextSibling)
                return node.nextSibling;
            node = node.parentNode;
        }
    }

    // http://stackoverflow.com/questions/667951/how-to-get-nodes-lying-inside-a-range-with-javascript
    export function getNodesInRange(range: Range) {
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
}