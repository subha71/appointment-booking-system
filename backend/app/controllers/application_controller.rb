class ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Basic::ControllerMethods

  before_action :authenticate

  def fallback_index_html
    render file: Rails.public_path.join('index.html').to_s
  end

  private

  def authenticate
    # Skip authentication in test environment
    return true if Rails.env.test?

    # Require authentication if credentials are set
    if ENV['AUTH_USERNAME'].present? && ENV['AUTH_PASSWORD'].present?
      authenticate_or_request_with_http_basic do |username, password|
        ActiveSupport::SecurityUtils.secure_compare(username, ENV['AUTH_USERNAME']) &&
        ActiveSupport::SecurityUtils.secure_compare(password, ENV['AUTH_PASSWORD'])
      end
    end
  end
end
