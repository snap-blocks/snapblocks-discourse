function replaceSnapblocks(inline, state, tagInfo, content) {
  let options = {
    blockStyle: tagInfo.attrs._default || tagInfo.attrs.blockStyle,
    wrap: tagInfo.attrs.wrap,
    wrapSize: tagInfo.attrs.wrapSize,
    zebra: tagInfo.attrs.zebra,
    showSpaces: tagInfo.attrs.showSpaces,
    santa: tagInfo.attrs.santa,
    inline,
  };

  let token = state.push("html_raw", "", 0);
  token.attrs = [
    ["class", "snapblocks-blocks"],
    ["data-blockStyle", options.blockStyle],
  ];

  let html = `<${inline ? "code" : "pre"} class="snapblocks-blocks"`;

  for (const [key, value] of Object.entries(options)) {
    if (value != null) {
      html += ` ${key}="${value}"`;
    }
  }

  html += ">";

  const escaped = state.md.utils.escapeHtml(content);
  html += `${escaped}</${inline ? "code" : "pre"}>`;

  token.content = html;
  return true;
}

export function setup(helper) {
  helper.allowList([
    "span.snapblocks-blocks",
    "span.snapblocks-blocks[blockStyle]",
    "span.snapblocks-blocks[wrap]",
    "span.snapblocks-blocks[wrapSize]",
    "span.snapblocks-blocks[zebra]",
    "span.snapblocks-blocks[showSpaces]",
    "span.snapblocks-blocks[santa]",
    "pre.snapblocks-blocks",
    "pre.snapblocks-blocks[blockStyle]",
    "pre.snapblocks-blocks[wrap]",
    "pre.snapblocks-blocks[wrapSize]",
    "pre.snapblocks-blocks[zebra]",
    "pre.snapblocks-blocks[showSpaces]",
    "pre.snapblocks-blocks[santa]",
  ]);

  let registerScratchblocks;

  helper.registerOptions((opts, siteSettings) => {
    opts.features["snapblocks"] = !!siteSettings.snapblocks_enabled;
    registerScratchblocks = !!siteSettings.scratchblocks_alias;
  });

  helper.registerPlugin((md) => {
    md.block.bbcode.ruler.push("snapblocks", {
      tag: "snapblocks",
      replace(state, tagInfo, content) {
        return replaceSnapblocks(false, state, tagInfo, content);
      },
    });

    if (registerScratchblocks) {
      md.block.bbcode.ruler.push("scratchblocks", {
        tag: "scratchblocks",
        replace(state, tagInfo, content) {
          return replaceSnapblocks(false, state, tagInfo, content);
        },
      });
    }

    md.inline.bbcode.ruler.push("sb", {
      tag: "sb",
      replace(state, tagInfo, content) {
        return replaceSnapblocks(true, state, tagInfo, content);
      },
    });
  });
}
