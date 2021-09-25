type DomEvent = (state: any) => any;

const isObj = (x: any): x is object =>
  Object.prototype.toString.call(x) == "[object Object]";
const isEvt = (x: any): x is DomEvent => typeof x == "function";

let _mount: HTMLElement, _view: (state: any) => any[];
const _evts = new Map<number, DomEvent>();
const store = (state?: any): any =>
  state
    ? [localStorage.setItem("pH7", JSON.stringify(state)), update()]
    : JSON.parse(localStorage.getItem("pH7") ?? "null");

const mount = (component: HTMLElement, view: typeof _view, state: any) => {
  [_mount, _view] = [component, view];
  store(store() || state);
};

const update = () => [_evts.clear(), (_mount.innerHTML = html(_view(store())))];

const evt = (key: number) => store({ ...store(), ..._evts.get(key)!(store()) });

const html = (x: any) => (Array.isArray(x) ? arrHtml(x) : `${x}`);

const arrHtml = ([head, ...node]: any[]): string => {
  if (Array.isArray(head)) {
    return arrHtml(head) + node.map(html).join("");
  }
  let elAttrs =
    node.length && isObj(node[0]) ? attrs(node.shift()).join("") : "";
  const [tagAndId, ...classes] = head.split(".");
  const [tag, id] = tagAndId.split("#");
  return `<${tag}${id ? ` id="${id}"` : ""} ${
    classes.length ? `class="${classes.join(" ")}` : ""
  }${elAttrs}>${node.map(html).join("")}</${tag}>`;
};

const attr = (a: any): string => (isEvt(a) ? makeEvt(a) : a);
const attrs = (node: any) =>
  Object.keys(node).map(a => ` ${a}="${attr(node[a])}"`);

const makeEvt = (handler: DomEvent, key = Math.random()) =>
  _evts.set(key, handler) && `evt(${key})`;
