/**
 * 纯字符串解析 HTML 标签
 * 支持：单标签、双标签、嵌套标签、属性、自闭合标签
 * 输出格式严格匹配你截图的 { type, prop, children? }
 */
function parseTags(html) {
  // 清理空白、换行，不影响解析
  html = html.trim().replace(/\s+/g, ' ');
  const result = [];
  const stack = [];
  let currentParent = null;

  // 正则匹配所有标签 <xxx ...> 或 </xxx>
  const tagRegex = /<(\/?)([\w-]+)(\s[^>]*?)?(\/?)>/g;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    const isClose = !!match[1];       // 是否闭合标签 </xxx>
    const tagName = match[2].toLowerCase(); // 标签名
    const attrStr = match[3] || '';   // 属性字符串
    const isSelfClose = !!match[4];   // 是否自闭合 <input/>

    // 1. 解析属性 => { id: "...", class: "..." }
    const prop = {};
    const attrRegex = /([\w-]+)\s*=\s*["']([^"']*)["']/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
      prop[attrMatch[1].toLowerCase()] = attrMatch[2];
    }

    // 2. 构建标签对象
    const tag = { type: tagName, prop };

    // 3. 自闭合标签 / 闭合标签：直接加入当前父节点
    if (isSelfClose || isClose) {
      if (currentParent) {
        if (!currentParent.children) currentParent.children = [];
        currentParent.children.push(tag);
      } else {
        result.push(tag);
      }
      if (isClose) stack.pop(); // 闭合标签出栈
      continue;
    }

    // 4. 嵌套标签处理（入栈）
    if (currentParent) {
      if (!currentParent.children) currentParent.children = [];
      currentParent.children.push(tag);
    } else {
      result.push(tag);
    }
    stack.push(tag);
    currentParent = tag;
  }

  // 单标签直接返回对象，多/嵌套返回数组
  return result.length === 1 ? result[0] : result;
}
function log(obj) {
  console.log(JSON.stringify(obj, null, 2));
}
const tag1 = '<input type="hidden" id="testId" name="testName" value="123">';
log(parseTags(tag1));
