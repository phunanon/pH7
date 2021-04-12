type DomEvent = (state: any) => any;
type View = (state: any) => any[];

const isArr = Array.isArray;
const isStr = (x: any): x is string => typeof x == "string";
const isObj = (x: any): x is object => typeof x == "object";
const isEvt = (x: any): x is DomEvent => typeof x == "function";
const isUnd = (x: any): x is undefined => typeof x == "undefined";

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
  _mount.innerHTML = toHtml(_view({ ..._state }));
}

function doEvent(handlerKey: number): void {
  _state = { ..._state, ...(_handlers.get(handlerKey)?.(_state) ?? {}) };
  update();
}

const toHtml = (node: any): string =>
  isUnd(node) ? "" : isArr(node) ? arrayToHtml(node) : node.toString();

function arrayToHtml(node: any[]): string {
  const [head] = node.splice(0, 1);
  if (isArr(head)) {
    return arrayToHtml(head) + node.map(toHtml).join("");
  }
  if (!isStr(head)) {
    console.log(`Bad head: ${head}`);
    return "";
  }
  let elAttrs = "";
  if (node.length && isObj(node[0]) && !isArr(node[0])) {
    elAttrs = attrs(node[0]);
    node.shift();
  }
  const [tagAndId, ...classes] = head.split(".");
  const [tag, id] = tagAndId.split("#");
  return `<${tag}${id ? ` id="${id}"` : ""} ${
    classes.length ? `class="${classes.join(" ")}` : ""
  }${elAttrs}>
            ${node.map(toHtml).join("")}
          </${tag}>`;
}

const attr = (attr: string | DomEvent): string =>
  isEvt(attr) ? makeEvent(attr) : attr;
const attrs = (node: any): string =>
  Object.keys(node)
    .map(a => ` ${a}="${attr(node[a])}"`)
    .join("");

function makeEvent(handler: DomEvent): string {
  const key = hash(handler.toString());
  _handlers.set(key, handler);
  return `doEvent(${key})`;
}
