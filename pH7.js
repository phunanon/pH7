"use strict";
const isObj = (x) => Object.prototype.toString.call(x) == "[object Object]";
const isEvt = (x) => typeof x == "function";
let _mount, _view;
const _evts = new Map();
const store = (state) => state
    ? [localStorage.setItem("pH7", JSON.stringify(state)), update()]
    : JSON.parse(localStorage.getItem("pH7") ?? "null");
const mount = (component, view, state) => {
    [_mount, _view] = [component, view];
    store(store() || state);
};
const update = () => [_evts.clear(), (_mount.innerHTML = html(_view(store())))];
const evt = (event, key) => {
    event.stopPropagation();
    store({ ...store(), ..._evts.get(key)(store()) });
};
const html = (x) => (Array.isArray(x) ? arrHtml(x) : `${x}`);
const arrHtml = ([head, ...node]) => {
    if (Array.isArray(head)) {
        return arrHtml(head) + node.map(html).join("");
    }
    let elAttrs = node.length && isObj(node[0]) ? attrs(node.shift()).join("") : "";
    const [tagAndId, ...classes] = head.split(".");
    const [tag, id] = tagAndId.split("#");
    return `<${tag}${id ? ` id="${id}"` : ""} ${classes.length ? `class="${classes.join(" ")}` : ""}${elAttrs}>${node.map(html).join("")}</${tag}>`;
};
const attr = (a) => (isEvt(a) ? makeEvt(a) : a);
const attrs = (node) => Object.keys(node).map(a => ` ${a}="${attr(node[a])}"`);
const makeEvt = (handler, key = Math.random()) => _evts.set(key, handler) && `evt(event, ${key})`;
//# sourceMappingURL=pH7.js.map