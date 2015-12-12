module lincore {        

    export function makeExpandable(head: JQuery, body: JQuery, expandedCssClass = "expanded", duration?: number) {
        var isExpanded = () => body.height() > 0;        

        head.click((e) => {
            if (isExpanded()) {
                head.removeClass(expandedCssClass);
            } else {
                head.addClass(expandedCssClass);
            }
            body.slideToggle(duration);
        });
    }

    export function makeAllExpandable(elements: JQuery, headRefAttribute = "data-head", expandedCssClass = "expanded", duration?: number) {
        for (var i = 0, len = elements.length; i < len; i++) {
            var body = $(elements[i]);
            var head = $(body.attr(headRefAttribute));
            makeExpandable(head, body, expandedCssClass, duration);
        }
    }
    

    
}