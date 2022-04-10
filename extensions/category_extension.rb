# frozen_string_literal: true

module MakePublicCategory
  module CategoryExtension
    def cast(key)
      ActiveModel::Type::Boolean.new.cast(custom_fields[key]) || false
    end

    %w[
      make_public_enabled
    ].each do |key|
      define_method(key.to_sym) { cast(key) }
    end
  end
end
