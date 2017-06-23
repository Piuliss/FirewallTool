class NormalPackage < Package
  after_initialize :initial_setting
  private
  def initial_setting
    self.amount = 0
    self.pre_configured_type = false
  end
end