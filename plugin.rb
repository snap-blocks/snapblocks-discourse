# frozen_string_literal: true

# name: snapblocks-discourse
# about: Snapblocks plugin for discourse
# meta_topic_id: TODO
# version: 1.0.0
# authors: ego-lay-atman-bay
# url: https://github.com/snap-blocks/snapblocks-discourse

enabled_site_setting :snapblocks_enabled

after_initialize do
  on(:reduce_cooked) do |fragment, post|
    fragment
      .css(".snapblocks-blocks")
      .each do |el|
        link = fragment.document.create_element("code")
        link.content = "snapblocks"
        el.inner_html = link.to_html
      end
  end
end
