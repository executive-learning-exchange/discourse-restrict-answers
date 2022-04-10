# frozen_string_literal: true

module MakePublicCategory
  module CategoryCustomFieldExtension
    def self.included(base)
      base.after_commit :update_post_order, if: :make_public_changed
    end

    def make_public_changed
      name == 'make_public_enabled'
    end

    def update_post_order
      Jobs.enqueue(:update_category_post_order, category_id: category_id)
    end
  end
end
