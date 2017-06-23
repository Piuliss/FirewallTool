include ApplicationHelper
class ApplicationController < ActionController::Base

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  before_filter :authenticate_user!

  layout :layout_by_resource

  protected

  def layout_by_resource
    if params[:action] == "new" && (params[:controller] == "devise/registrations" || params[:controller] == "devise/sessions")
      "login"
    else
      "application"
    end
  end


end
