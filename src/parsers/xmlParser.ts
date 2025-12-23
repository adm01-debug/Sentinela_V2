export function parseXML(xml: string): Document { return new DOMParser().parseFromString(xml, 'text/xml'); }
export function xmlToJson(xml: string): any {
  const doc = parseXML(xml);
  function nodeToJson(node: Node): any {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent?.trim() || null;
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const el = node as Element;
    const obj: any = {};
    Array.from(el.attributes).forEach(a => obj['@' + a.name] = a.value);
    const children = Array.from(el.childNodes).filter(n => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()));
    if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) return { ...obj, '#text': children[0].textContent?.trim() };
    children.forEach(c => { const name = c.nodeName; const val = nodeToJson(c); if (obj[name]) { if (!Array.isArray(obj[name])) obj[name] = [obj[name]]; obj[name].push(val); } else obj[name] = val; });
    return obj;
  }
  return nodeToJson(doc.documentElement);
}
