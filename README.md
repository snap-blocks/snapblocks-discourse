# **Snapblocks** Discourse Plugin

For more information, please see: https://meta.discourse.org/t/snapblocks-discourse-plugin/310155

[Snapblocks](https://snap-blocks.github.io/) is a library that is able to convert text into [Snap<i>!</i>](https://snap.berkeley.edu/) block images. This Discourse plugin allows users to use snapblocks on a Discourse forum, mainly for the [Snap<i>!</i> Forum](https://forum.snap.berkeley.edu/).

## Usage

You can create snapblocks in a post, by typing snapblocks code inside `[snapblocks][/snapblocks]` bbcode tags. For example:

```markdown
[snapblocks]
move (10) steps
[/snapblocks]
```

You can alternatively use `[scratchblocks][/scratchblocks]` for compatibility purposes (snapblocks is a fork of [scratchblocks](https://scratchblocks.github.io/), and there was an old Discourse plugin on the Snap<i>!</i> forum that allowed users to type scratchblocks inside `[scratchblocks][/scratchblocks]` tags).

You can also use `[sb][/sb]` to add snapblocks code inline.

```markdown
Use the [sb]move (10) steps[/sb] block to move forward.
```

## Options

There are a few settings available to change how snapblocks are rendered.

- Block Style
- Block Scale
- Zebra Coloring
- Block Wrap
- Show Spaces

Many options can also be used in snapblocks snippets.

```
[snapblocks blockStyle="snap-flat" wrap="true" wrapSize=100 zebra="true" showSpaces="false"]
if <[] = []> {
  forever {
    run ({} @addInput) with inputs [Hello world] @delInput @verticalEllipsis @addInput
  }
}
[/snapblocks]
```

You can also set the block style using the default parameter.

```markdown
[snapblocks="snap-flat"]
move (10) steps
[/snapblocks]
```
