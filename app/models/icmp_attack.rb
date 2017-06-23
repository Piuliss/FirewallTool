class IcmpAttack < Package
  after_initialize :initial_setting
  before_save :initial_setting
  private
  def initial_setting
    self.pre_configured_type = true
  end
end