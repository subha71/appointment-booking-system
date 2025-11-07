class CreateAppointments < ActiveRecord::Migration[7.1]
  def change
    create_table :appointments do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.string :phone
      t.datetime :date_time, null: false
      t.text :reason

      t.timestamps
    end

    add_index :appointments, :date_time, unique: true
  end
end
