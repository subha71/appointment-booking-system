class ApplicationController < ActionController::API
  def fallback_index_html
    render file: Rails.public_path.join('index.html').to_s
  end
end
