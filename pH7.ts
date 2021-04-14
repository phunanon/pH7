type DomEvent = (state: any) => any;
type View = (state: any) => any[];

const isObj = (x: any): x is object =>
  Object.prototype.toString.call(x) == "[object Object]";
const isEvt = (x: any): x is DomEvent => typeof x == "function";

let _mount: HTMLElement, _view: View, _state: {};
const _handlers = new Map<number, DomEvent>();

function mount(component: HTMLElement, view: View, state: any): void {
  [_mount, _view, _state] = [component, view, state];
  update();
}

function update(): void {
  _handlers.clear();
  _mount.innerHTML = html(_view(_state));
}

function doEvent(handlerKey: number): void {
  _state = { ..._state, ..._handlers.get(handlerKey)?.(_state) };
  update();
}

const html = (x: any): string => (Array.isArray(x) ? arrHtml(x) : x.toString());

function arrHtml([head, ...node]: any[]): string {
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
}

const attr = (a: any): string => (isEvt(a) ? makeEvt(a) : a);
const attrs = (node: any): string[] =>
  Object.keys(node).map(a => ` ${a}="${attr(node[a])}"`);

function makeEvt(handler: DomEvent): string {
  const key = Math.random();
  _handlers.set(key, handler);
  return `doEvent(${key})`;
}
