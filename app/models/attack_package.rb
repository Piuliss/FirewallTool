class AttackPackage < Package
  after_initialize :initial_setting
  private
  def initial_setting
    self.pre_configured_type = false
  end
end