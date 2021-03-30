
type State = any;
type DomEvent = (state: State) => State;
type View = (state: State) => any[];

function hash (s: string): number {
  for (var i = 0, h = 9; i < s.length; )
    h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9);
  return h ^ (h >>> 9);
}

let _mount: HTMLElement, _view: View, _state: State;
const _handlers = new Map<number, DomEvent>();

function mount (component: HTMLElement, view: View, state: State): void {
  [_mount, _view, _state] = [component, view, state];
  update();
}

function update (): void {
  _mount.innerHTML = toHtml(_view({..._state}));
}

function doEvent (handlerKey: number): void {
  _state = {..._state, ..._handlers.get(handlerKey)?.(_state) ?? {}};
  update();
}

function makeEvent (handler: DomEvent): string {
  const key = hash(handler.toString());
  _handlers.set(key, handler);
  return `doEvent(${key})`;
}

function toHtml (node: any): string {
  if (typeof node == "undefined") {
    return "";
  }
  return Array.isArray(node) ? arrayToHtml(node) : node.toString();
}

function arrayToHtml (node: any[]): string {
  const [head] = node.splice(0, 1);
  if (Array.isArray(head)) {
    return arrayToHtml(head) + node.map(toHtml).join("");
  }
  if (typeof head != "string") {
    console.log(`Bad head: ${head}`);
    return "";
  }
  let elAttrs = "";
  if (node.length && typeof node[0] == "object" && !Array.isArray(node[0])) {
    elAttrs = attrs(node[0]);
    node.shift();
  }
  const [tagAndId, ...classes] = head.split(".");
  const [tag, id] = tagAndId.split("#");
  return `<${tag}${id ? ` id="${id}"` : ""} ${classes.length ? `class="${classes.join(" ")}` : ""}${elAttrs}>
            ${node.map(toHtml).join("")}
          </${tag}>`;
}

const attr = (attr: string | DomEvent): string => typeof attr == "function" ? makeEvent(attr) : attr;
const attrs = (node: any): string => Object.keys(node).map(a => ` ${a}="${attr(node[a])}"`).join("");