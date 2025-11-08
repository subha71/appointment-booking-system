module Api
  module V1
    class AppointmentsController < ApplicationController
      before_action :set_appointment, only: [:destroy]

      # GET /api/v1/appointments
      def index
        @appointments = Appointment.all.order(:date_time)
        render json: @appointments, status: :ok
      end

      # GET /api/v1/appointments/available
      def available
        start_date = params[:start_date] ? Date.parse(params[:start_date]) : Date.current
        end_date = params[:end_date] ? Date.parse(params[:end_date]) : start_date + 7.days

        available_slots = generate_available_slots(start_date, end_date)
        render json: { available_slots: available_slots }, status: :ok
      rescue ArgumentError => e
        render json: { error: "Invalid date format" }, status: :bad_request
      end

      # POST /api/v1/appointments
      def create
        @appointment = Appointment.new(appointment_params)

        if @appointment.save
          render json: @appointment, status: :created
        else
          render json: { errors: @appointment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/appointments/:id
      def destroy
        @appointment.destroy
        render json: { message: "Appointment cancelled successfully" }, status: :ok
      end

      private

      def set_appointment
        @appointment = Appointment.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Appointment not found" }, status: :not_found
      end

      def appointment_params
        params.require(:appointment).permit(:name, :email, :phone, :date_time, :reason)
      end

      def generate_available_slots(start_date, end_date)
        booked_slots = Appointment.where(date_time: start_date.beginning_of_day..end_date.end_of_day)
                                  .pluck(:date_time)
                                  .map { |dt| dt.to_i }

        available_slots = []
        current_date = start_date

        while current_date <= end_date
          # Only include weekdays (Monday = 1, Friday = 5)
          if (1..5).include?(current_date.wday)
            # Generate slots from 9:00 AM to 4:30 PM in 30-minute increments
            (9..16).each do |hour|
              [0, 30].each do |minute|
                # Skip anything after 4:30 PM (don't include 5:00 PM)
                next if hour == 16 && minute > 30
                break if hour >= 17

                slot_time = current_date.to_time.change(hour: hour, min: minute)

                # Only include future slots and slots not already booked
                if slot_time > Time.current && !booked_slots.include?(slot_time.to_i)
                  available_slots << {
                    date_time: slot_time.iso8601,
                    formatted: slot_time.strftime("%A, %B %d, %Y at %I:%M %p")
                  }
                end
              end
            end
          end

          current_date += 1.day
        end

        available_slots
      end
    end
  end
end
