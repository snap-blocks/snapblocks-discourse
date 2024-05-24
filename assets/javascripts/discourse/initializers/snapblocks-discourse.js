import {
    addBlockDecorateCallback,
    addTagDecorateCallback,
} from "discourse/lib/to-markdown";
import snapblocks from 'discourse/plugins/snapblocks-discourse/lib/snapblocks.min.es'

import $ from "jquery";
import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "discourse-i18n";

function initializeSnapblocks(api) {
  api.decorateCooked(($elem) => $("snapblocks", $elem), {
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
    icon: "caret-right",
    label: "snapblocks.title",
  });
}

export default {
    name: 'apply-snapblocks',
    initialize() {
        window.snapblocks = snapblocks
        console.log(`snapblocks version: ${snapblocks.version}`)

        withPluginApi("1.15.0", initializeSnapblocks);
    }
};
