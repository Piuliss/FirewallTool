source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.0.0'

# Use pg as the database for Active Record
gem 'pg'
gem 'foreigner'

gem 'bitmask_attributes', git: "https://github.com/jigfox/bitmask_attributes.git", :branch => 'rails4'

gem 'enumerize', '0.5.1'

# Use SCSS for stylesheets
gem 'sass-rails', '~> 4.0.0'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# Use CoffeeScript for .js.coffee assets and views
gem 'coffee-rails', '~> 4.0.0'

gem 'bootstrap-sass', '~> 2.3.2.1'

# Use jquery as the JavaScript library
gem 'jquery-rails'

gem 'jquery-ui-rails', "~> 4.0.4"

gem 'remotipart', '~> 1.2'
#gem 'thin'

#gem 'simple_form'

group :development, :test do
  # gem 'rspec-rails', '2.11'
  #gem 'rspec-rails', '~> 3.5', '>= 3.5.2'
  gem 'capybara','1.1.2'
  gem 'annotate', '~> 2.5.0'

end


# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 1.2'

group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'sdoc', require: false
end

# See https://github.com/sstephenson/execjs#readme for more supported runtimes
gem 'therubyracer', :platforms => :ruby

gem "execjs"

# Use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# Use unicorn as the app server
group :production, :test do
  gem 'unicorn'
  gem 'unicorn-worker-killer'
end

# Use Capistrano for deployment
# gem 'capistrano', group: :development

# Use debugger
# gem 'debugger', group: [:development, :test]

gem "devise"