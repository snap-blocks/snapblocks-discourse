import { withPluginApi } from "discourse/lib/plugin-api";
import {
  addBlockDecorateCallback,
  addTagDecorateCallback,
} from "discourse/lib/to-markdown";
import snapblocks from "discourse/plugins/snapblocks-discourse/lib/snapblocks/snapblocks.min.es";
import loadTranslations from "discourse/plugins/snapblocks-discourse/lib/snapblocks/translations-all-es";
import richEditorExtension from '../../lib/rich-editor-extension';

function applySnapblocks(element, siteSettings) {
  // return
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
      languages: Object.keys(snapblocks.allLanguages),
    });
  }

  element.querySelectorAll(".snapblocks-blocks").forEach((sb) => {
    renderElement(sb);
    if (sb.getAttribute("data-snapblocks-source")) {
      sb.setAttribute(
        "data-snapblocks-source",
        sb.getAttribute("data-snapblocks-source").replaceAll("\n", "&NewLine;")
      );
    }
  });
}

function initializeSnapblocks(api, siteSettings) {
  api.decorateCookedElement((el) => applySnapblocks(el, siteSettings), {
    id: "snapblocks-discourse",
  });

  api.addComposerToolbarPopupMenuOption({
    action: function (toolbarEvent) {
       if (toolbarEvent.commands) {
        toolbarEvent.commands.toggleSnapblocks();
      } else {
        toolbarEvent.applySurround(
          "\n[snapblocks]\n",
          "\n[/snapblocks]\n",
          "snapblocks_text",
          {
            multiline: false,
          }
        );
      }
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
          prefix += ` ${attr}=${attributes['data-' + attr]}`;
        }
      }

      prefix += "]";

      this.prefix = prefix;
      this.suffix = "[/sb]";
      return attributes["data-snapblocks-source"].replaceAll("&NewLine;", "\n");
    }
  });
  addBlockDecorateCallback(function () {
    const { attributes } = this.element;

    if (attributes["data-snapblocks-source"]) {
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
          prefix += ` ${attr}=${attributes['data-' + attr]}`;
        }
      }

      prefix += "]";

      this.prefix = prefix;
      this.suffix = "[/snapblocks]";
      return `\n${attributes["data-snapblocks-source"].replaceAll(
        "&NewLine;",
        "\n"
      )}\n`;
    }
  });
  
  api.registerRichEditorExtension(richEditorExtension)
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
