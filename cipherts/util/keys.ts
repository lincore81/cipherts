module lincore {

    export var specialKeys = <Dict<boolean>>Set([
        null, "Unidentified", "Esc", "Escape",
        "Left", "Right", "Up", "Down", "Dead",
        "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
        "PageDown", "PageUp", "Home", "End", "CapsLock", "Pause",
        "Shift", "Alt", "Control", "Win", "OS", "AltGraph",
        "F1", "F2", "F3", "F4", "F5", "F6",
        "F7", "F8", "F9", "F10", "F11", "F12",
        "F13", "F14", "F15", "F16", "F17", "F18",
        "F19", "F20", "F21", "F22", "F23", "F24"
    ]);

    export function isSpecialKey(event): boolean {
        var key = event.key !== undefined ? event.key : event.keyIdentifier;        
        return specialKeys[key] || event.altKey || event.ctrlKey || event.metaKey;
    }
}