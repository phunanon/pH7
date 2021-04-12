type DomEvent = (state: any) => any;
type View = (state: any) => any[];

const isArr = Array.isArray;
const isStr = (x: any): x is string => typeof x == "string";
const isObj = (x: any): x is object => typeof x == "object";
const isEvt = (x: any): x is DomEvent => typeof x == "function";

function hash(s: string): number {
  for (var i = 0, h = 9; i < s.length; )
    h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9);
  return h ^ (h >>> 9);
}

let _mount: HTMLElement, _view: View, _state: any;
const _handlers = new Map<number, DomEvent>();

function mount(component: HTMLElement, view: View, state: any): void {
  [_mount, _view, _state] = [component, view, state];
  update();
}

function update(): void {
  _mount.innerHTML = html(_view({ ..._state }));
}

function doEvent(handlerKey: number): void {
  _state = { ..._state, ..._handlers.get(handlerKey)?.(_state) };
  update();
}

const html = (x: any): string => (isArr(x) ? arrHtml(x) : x.toString());

function arrHtml(node: any[]): string {
  const head = node.shift();
  if (isArr(head)) {
    return arrHtml(head) + node.map(html).join("");
  }
  let elAttrs =
    node.length && isObj(node[0]) && !isArr(node[0])
      ? attrs(node.shift()).join("")
      : "";
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
  const key = hash(handler.toString());
  _handlers.set(key, handler);
  return `doEvent(${key})`;
}
