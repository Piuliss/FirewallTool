module ApplicationHelper

  def current_user=(user)
    @current_user = user
  end

  def current_user
    @current_user ||= User.find_by_remember_token(cookies[:order_remember_token])
  end

  def flash_message
    response = []
    flash.each do |key, value|
      if value
        response << "<div class='alert alert-#{key}'>"
        response << "<button type='button' class='close' data-dismiss='alert'>&times;</button>"
        response << "#{value}"
        response << "</div>"
      end
    end
    flash.each { |k, _| flash.delete k }
    response.join('').html_safe
  end
end
