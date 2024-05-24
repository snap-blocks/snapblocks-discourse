const rule = {
    tag: "snapblocks",

    replace(state, tagInfo, content) {
        console.log('attrs', tagInfo.attrs)
        let options = {
            blockStyle: tagInfo.attrs._default || tagInfo.attrs.blockStyle,
            wrap: tagInfo.attrs.wrap,
            wrapSize: tagInfo.attrs.wrapSize,
            zebra: tagInfo.attrs.zebra,
            showSpaces: tagInfo.attrs.showSpaces,
        }
        let token = state.push("html_raw", "", 0);
        // token.tag = "snapblocks"
        token.attrs = [["class", "snapblocks-blocks"],["data-blockStyle", options.blockStyle]]

        let html = '<pre class="snapblocks-blocks"'

        for (const [key, value] of Object.entries(options)) {
            if (value != null) {
                html += ` ${key}="${value}"`
            }
        }

        html += ">"

        const escaped = state.md.utils.escapeHtml(content);
        html += `${escaped}</pre>`

        token.content = html;
        console.log('content', token.content)
        
        console.log('state', state)
        console.log('token', token)
        return true;
    },
};
  
export function setup(helper) {
    helper.allowList([
        'pre.snapblocks-blocks',
        'pre.snapblocks-blocks[blockStyle]',
        'pre.snapblocks-blocks[wrap]',
        'pre.snapblocks-blocks[wrapSize]',
        'pre.snapblocks-blocks[zebra]',
        'pre.snapblocks-blocks[showSpaces]',
    ]);

    helper.registerPlugin((md) => {
        md.block.bbcode.ruler.push("snapblocks", rule);
    });
}
