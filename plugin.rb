# frozen_string_literal: true

# name: Hide-Answers-plugin
# about: Restrict replies in certain categories to the OP and specified groups
# fork from https://github.com/discourse/discourse-restricted-replies
# version: 0.0.1
# authors: Alex Wang
# transpile_js: true


enabled_site_setting :restricted_replies_enabled
register_asset "stylesheets/restrict-replies.scss"


after_initialize do
  %w(
    ../extensions/category_custom_field_extension.rb
    ../extensions/category_extension.rb
  ).each do |path|
    load File.expand_path(path, __FILE__)
  end

  %w[
    make_public_enabled
  ].each do |key|
    Category.register_custom_field_type(key, :boolean)
    add_to_serializer(:basic_category, key.to_sym) { object.send(key) }

    if Site.respond_to?(:preloaded_category_custom_fields)
      Site.preloaded_category_custom_fields << key
    end
  end

  class ::Category
    include MakePublicCategory::CategoryExtension
  end

  class ::CategoryCustomField
    include MakePublicCategory::CategoryCustomFieldExtension
  end


end