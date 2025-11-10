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

  const attrs = [
    ['class', 'snapblocks-blocks'],
    ['data-snapblocks-source', state.md.utils.escapeHtml(content)]
  ]

  for (const [key, value] of Object.entries(options)) {
    if (value != null) {
      attrs.push(['data-' + key, String(value)])
    }
  }

  let token = state.push('snapblocks_open', inline ? 'code' : 'pre', 1)
  token.attrs = attrs
  token = state.push('text', '', 0)
  token.content = content
  token = state.push('snapblocks_close', inline ? 'code' : 'pre', -1)

  return true
}

export function setup(helper) {
  helper.allowList([
    "pre.snapblocks-blocks",
    "span.snapblocks-source",
    "code.snapblocks-blocks",
    "pre[data-*]",
    "span[data-*]",
    "code[data-*]",
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

    // console.log('rulser', md.block.bbcode.ruler)
  });
}
