const CONTAINS_BLOCK_REGEX = /\n|<img|!\[[^\]]*\][(\[]/;

function insertSpoiler(_, snapblocksCode) {
  const element = "code";
  return `<${element} class='snapblocks-blocks'>${snapblocksCode}</${element}>`;
}

function replaceSnapblocks(text) {
  text ||= "";
  let previousText;

  do {
    previousText = text;
    text = text.replace(
      /\[snapblocks\]((?:(?!\[snapblocks\]|\[\/snapblocks\]))*)\[\/snapblocks\]/gi,
      insertSpoiler
    );
  } while (text !== previousText);

  return text;
}

function setupMarkdownIt(helper) {
  helper.registerOptions((opts, siteSettings) => {
    opts.features["snapblocks"] = !!siteSettings.spoiler_enabled;
  });

  helper.registerPlugin((md) => {
    md.inline.bbcode.ruler.push("snapblocks", {
      tag: "snapblocks",
      wrap: "code.snapblocks",
    });

    md.block.bbcode.ruler.push("snapblocks", {
      tag: "snapblocks",
      wrap: "pre.snapblocks",
    });
  });
}

export function setup(helper) {
  helper.allowList(["code.snapblocks", "pre.snapblocks"]);

  if (helper.markdownIt) {
    setupMarkdownIt(helper);
  } else {
    helper.addPreProcessor(replaceSnapblocks);
  }
}
