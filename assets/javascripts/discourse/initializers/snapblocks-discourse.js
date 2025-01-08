import { withPluginApi } from "discourse/lib/plugin-api";
import snapblocks from "discourse/plugins/snapblocks-discourse/lib/snapblocks/snapblocks.min.es";
import {
  addBlockDecorateCallback,
  addTagDecorateCallback,
} from "discourse/lib/to-markdown";
import loadTranslations from "discourse/plugins/snapblocks-discourse/lib/snapblocks/translations-all-es";

function applySnapblocks(element, siteSettings) {
  async function renderElement(el) {
    let style = el.getAttribute("blockStyle") || siteSettings.block_style;
    snapblocks.renderElement(el, {
      style: siteSettings.block_style,
      zebra: siteSettings.zebra_coloring,
      wrap: siteSettings.block_wrap,
      showSpaces: siteSettings.show_spaces,
      santa: siteSettings.santa_hats,
      scale: style.startsWith("scratch3")
        ? siteSettings.block_scale * 0.675
        : siteSettings.block_scale,
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

  addTagDecorateCallback(function () {
    const { attributes } = this.element;

    if (attributes["snapblocks-source"]) {
      let prefix = "[sb";

      const attrs = [
        "blockstyle",
        "wrap",
        "wrapsize",
        "zebra",
        "showspaces",
        "santa",
      ];
      for (const attr of attrs) {
        if (attributes[attr]) {
          prefix += ` ${attr}=${attributes[attr]}`;
        }
      }

      prefix += "]";

      this.prefix = prefix;
      this.suffix = "[/sb]";
      return attributes["snapblocks-source"];
    }
  });
  addBlockDecorateCallback(function () {
    const { attributes } = this.element;

    if (attributes["snapblocks-source"]) {
      let prefix = "[snapblocks";

      const attrs = [
        "blockstyle",
        "wrap",
        "wrapsize",
        "zebra",
        "showspaces",
        "santa",
      ];
      for (const attr of attrs) {
        if (attributes[attr]) {
          prefix += ` ${attr}=${attributes[attr]}`;
        }
      }

      prefix += "]";

      this.prefix = prefix;
      this.suffix = "[/snapblocks]";
      return `\n${attributes["snapblocks-source"]}\n`;
    }
  });
}

export default {
  name: "apply-snapblocks",
  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");
    // console.debug(`snapblocks version: ${snapblocks.version}`);

    if (siteSettings.snapblocks_enabled) {
      loadTranslations(snapblocks);
      withPluginApi("1.15.0", (api) => {
        return initializeSnapblocks(api, siteSettings);
      });
    }
  },
};
