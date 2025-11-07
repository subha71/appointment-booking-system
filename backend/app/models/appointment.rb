class Appointment < ApplicationRecord
  # Validations
  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, format: { with: /\A[+]?[\d\s\-()]+\z/, message: "must be a valid phone number" }, allow_blank: true
  validates :date_time, presence: true
  validates :reason, length: { maximum: 200 }

  validate :date_time_cannot_be_in_past
  validate :date_time_must_be_in_business_hours
  validate :date_time_must_be_30_minute_increment

  # Scopes
  scope :upcoming, -> { where('date_time >= ?', Time.current).order(:date_time) }
  scope :past, -> { where('date_time < ?', Time.current).order(date_time: :desc) }

  private

  def date_time_cannot_be_in_past
    if date_time.present? && date_time < Time.current
      errors.add(:date_time, "cannot be in the past")
    end
  end

  def date_time_must_be_in_business_hours
    return unless date_time.present?

    # Business hours: Monday-Friday, 9 AM - 5 PM
    day_of_week = date_time.wday
    hour = date_time.hour
    minute = date_time.min

    # Check if it's a weekday (1-5 represents Monday-Friday)
    unless (1..5).include?(day_of_week)
      errors.add(:date_time, "must be on a weekday (Monday-Friday)")
      return
    end

    # Check if time is within 9 AM - 5 PM
    # Note: Last appointment should be at 4:30 PM to end by 5:00 PM
    if hour < 9 || hour >= 17 || (hour == 16 && minute > 30)
      errors.add(:date_time, "must be between 9:00 AM and 4:30 PM")
    end
  end

  def date_time_must_be_30_minute_increment
    return unless date_time.present?

    # Check if minutes are either 0 or 30
    unless [0, 30].include?(date_time.min)
      errors.add(:date_time, "must be in 30-minute increments (e.g., 9:00, 9:30)")
    end
  end
end
