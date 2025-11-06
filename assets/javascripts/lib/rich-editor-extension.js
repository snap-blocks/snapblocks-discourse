import { i18n } from "discourse-i18n";

const SNAPBLOCKS_NODES = ["inline_snapblocks", "snapblocks"];

/** @type {RichEditorExtension} */
const extension = {
  nodeSpec: {
    snapblocks: {
      attrs: {
        rendered: { default: true },
        'snapblocks-source': {default: ''},
        inline: {default: false},
      },
      group: "block",
      content: "block+",
      createGapCursor: true,
      parseDOM: [{
        tag: `div.snapblocks-blocks`,
        getContent(node, schema) {
            console.log('snapblocks node', node, schema)
            return node.getAttribute('snapblocks-source')
        }
      }],
      toDOM: () => ["pre", { class: "snapblocks-blocks" }, 0],
    },
    inline_snapblocks: {
      attrs: { rendered: { default: true } },
      group: "inline",
      inline: true,
      content: "inline*",
      parseDOM: [{ tag: "span.snapblocks-blocks" }],
      toDOM: () => ["span", { class: "snapblocks-blocks" }, 0],
    },
  },
  parse: {
    bbcode_snapblocks(state, token) {
      console.log('snapblocks', state, token)
      return true
    },
    wrap_bbcode(state, token) {
      console.log('snapblocks', state, token)
      if (token.nesting === 1 && token.attrGet("class") === "snapblocks-blocks") {
        state.openNode(state.schema.nodes.snapblocks);
        return true;
      } else if (token.nesting === -1 && state.top().type.name === "snapblocks-blocks") {
        state.closeNode();
        return true;
      }
    },
  },
  serializeNode: {
    snapblocks(state, node) {
      state.write("[snapblocks]\n");
      state.renderContent(node);
      state.write("[/snapblocks]\n\n");
    },
    inline_snapblocks(state, node) {
      state.write("[sb]");
      state.renderInline(node);
      state.write("[/sb]");
    },
  },
  inputRules: ({ pmState: { TextSelection } }) => ({
    match: /\[(snapblocks|sb)\]$/,
    handler: (state, match, start, end) => {
      const { schema } = state;
      const textNode = schema.text(i18n("composer.snapblocks_text"));

      const atStart = state.doc.resolve(start).parentOffset === 0;

      const tr = state.tr;

      if (atStart) {
        tr.replaceWith(
          start - 1,
          end,
          schema.nodes.snapblocks.createAndFill(
            null,
            schema.nodes.paragraph.createAndFill(null, textNode)
          )
        );
      } else {
        tr.replaceWith(
          start,
          end,
          schema.nodes.inline_snapblocks.createAndFill(null, textNode)
        );
      }

      return tr.setSelection(
        TextSelection.create(tr.doc, start + 1, start + 1 + textNode.nodeSize)
      );
    },
  }),
  state: ({ utils, schema }, state) => ({
    inSnapblocks: SNAPBLOCKS_NODES.some((nodeType) =>
      utils.inNode(state, schema.nodes[nodeType])
    ),
  }),
  commands: ({ schema, utils, pmState: { TextSelection }, pmCommands }) => ({
    toggleSnapblocks() {
      return (state, dispatch, view) => {
        const { selection } = state;
        const { empty, $from, $to } = selection;

        const inSnapblocks = SNAPBLOCKS_NODES.some((nodeType) =>
          utils.inNode(state, schema.nodes[nodeType])
        );

        if (inSnapblocks) {
          // Find the nearest spoiler node and unwrap it by replacing with its contents
          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth);
            if (SNAPBLOCKS_NODES.includes(node.type.name)) {
              const snapblocksStart = $from.before(depth);
              const snapblocksEnd = snapblocksStart + node.nodeSize;

              // Extract content and replace spoiler with it
              const tr = state.tr.replaceWith(
                snapblocksStart,
                snapblocksEnd,
                node.content
              );

              dispatch?.(tr);

              return true;
            }
          }

          return false;
        }

        // For empty selection, create spoiler with placeholder text
        if (empty) {
          const textNode = schema.text(i18n("composer.snapblocks_text"));
          const isBlockSnapblocks = view.endOfTextblock("backward");
          const snapblocksNode = isBlockSnapblocks
            ? schema.nodes.snapblocks.createAndFill(
                null,
                schema.nodes.paragraph.createAndFill(null, textNode)
              )
            : schema.nodes.inline_snapblocks.createAndFill(null, textNode);

          const tr = state.tr.replaceSelectionWith(snapblocksNode);
          tr.setSelection(
            TextSelection.create(
              tr.doc,
              $from.pos + 1,
              $from.pos + 1 + textNode.nodeSize
            )
          );

          dispatch?.(tr);

          return true;
        }

        const isBlockNodeSelection =
          $from.parent === $to.parent &&
          $from.parentOffset === 0 &&
          $to.parentOffset === $from.parent.content.size &&
          $from.parent.isBlock &&
          $from.depth > 0;
        if (isBlockNodeSelection) {
          return pmCommands.wrapIn(schema.nodes.spoiler)(state, dispatch);
        }

        const slice = selection.content();
        const isInlineSelection = slice.openStart > 0 || slice.openEnd > 0;

        if (isInlineSelection) {
          const content = [];
          slice.content.forEach((node) =>
            node.isBlock
              ? node.content.forEach((child) => content.push(child))
              : content.push(node)
          );
          const snapblocksNode = schema.nodes.inline_snapblocks.createAndFill(
            null,
            content
          );

          const tr = state.tr.replaceWith($from.pos, $to.pos, snapblocksNode);
          tr.setSelection(
            TextSelection.create(
              tr.doc,
              $from.pos + 1,
              $from.pos + 1 + snapblocksNode.content.size
            )
          );

          dispatch?.(tr);

          return true;
        } else {
          return pmCommands.wrapIn(schema.nodes.snapblocks)(state, (tr) => {
            tr.setSelection(
              TextSelection.create(tr.doc, $from.pos + 2, $to.pos)
            );

            dispatch?.(tr);
          });
        }
      };
    },
  }),
  plugins({ pmState: { Plugin }, pmView: { Decoration, DecorationSet } }) {
    return new Plugin({
      props: {
        decorations(state) {
          return this.getState(state);
        },
      },
      state: {
        init(config, state) {
          // Initially blur all spoilers
          const decorations = [];

          state.doc.descendants((node, pos) => {
            if (SNAPBLOCKS_NODES.includes(node.type.name)) {
              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: "snapblocks-rendered",
                })
              );
            }
            return true;
          });

          return DecorationSet.create(state.doc, decorations);
        },
        apply(tr, set, oldState, newState) {
          // If there's a meta update, use it (for manual updates)
          if (tr.getMeta(this)) {
            return tr.getMeta(this);
          }

          // Map existing decorations through the transaction
          set = set.map(tr.mapping, tr.doc);

          // Only recalculate if selection changed (which includes document changes that affect selection)
          if (tr.selectionSet || tr.docChanged) {
            const decorations = [];
            const { selection } = newState;

            newState.doc.descendants((node, pos) => {
              if (SNAPBLOCKS_NODES.includes(node.type.name)) {
                const nodeStart = pos;
                const nodeEnd = pos + node.nodeSize;

                const cursorInSnapblocks =
                  (selection.from > nodeStart && selection.from < nodeEnd) ||
                  (selection.to > nodeStart && selection.to < nodeEnd) ||
                  (selection.from <= nodeStart && selection.to >= nodeEnd);

                if (!cursorInSnapblocks) {
                  decorations.push(
                    Decoration.node(nodeStart, nodeEnd, {
                      class: "snapblocks-rendered",
                    })
                  );
                }
              }
              return true;
            });

            return DecorationSet.create(newState.doc, decorations);
          }

          return set;
        },
      },
    });
  },
};

export default extension;
