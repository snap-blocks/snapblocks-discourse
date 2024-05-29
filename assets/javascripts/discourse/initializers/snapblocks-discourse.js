import snapblocks from "discourse/plugins/snapblocks-discourse/lib/snapblocks/snapblocks.min.es";
import { withPluginApi } from "discourse/lib/plugin-api";

function applySnapblocks(element, siteSettings) {
  async function renderElement(el) {
    snapblocks.renderElement(el, {
      style: siteSettings.block_style,
      zebra: siteSettings.zebra_coloring,
      wrap: siteSettings.block_wrap,
      showSpaces: siteSettings.show_spaces,
      elementOptions: true,
    });
  }

  element.querySelectorAll(".snapblocks-blocks").forEach((sb) => {
    renderElement(sb);
  });
}

function initializeSnapblocks(api, siteSettings) {
  api.decorateCookedElement((el) => applySnapblocks(el, siteSettings), {
    id: "snapblocks-discourse",
  });

  api.addComposerToolbarPopupMenuOption({
    action: function (toolbarEvent) {
      toolbarEvent.applySurround(
        "\n" + `[snapblocks]` + "\n",
        "\n[/snapblocks]\n",
        "snapblocks_text",
        { multiline: false }
      );
    },
    icon: "code",
    label: "snapblocks_discourse.title",
  });
}

export default {
  name: "apply-snapblocks",
  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");
    console.debug(`snapblocks version: ${snapblocks.version}`);

    withPluginApi("1.15.0", (api) => {
      return initializeSnapblocks(api, siteSettings);
    });
  },
};
