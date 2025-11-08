#!/bin/bash

echo "========================================="
echo "APPOINTMENT BOOKING SYSTEM - API TESTS"
echo "========================================="
echo ""

# Test 1: Health Check
echo "TEST 1: Health Check (/up)"
echo "-----------------------------------------"
curl -s http://localhost:3001/up | grep -q "background-color: green" && echo "✅ PASS: Server is running" || echo "❌ FAIL: Server not responding"
echo ""

# Test 2: Get all appointments (empty initially)
echo "TEST 2: GET /api/v1/appointments (empty)"
echo "-----------------------------------------"
response=$(curl -s http://localhost:3001/api/v1/appointments)
echo "Response: $response"
if [ "$response" == "[]" ]; then
    echo "✅ PASS: Returns empty array"
else
    echo "❌ FAIL: Should return empty array"
fi
echo ""

# Test 3: Get available slots
echo "TEST 3: GET /api/v1/appointments/available"
echo "-----------------------------------------"
response=$(curl -s "http://localhost:3001/api/v1/appointments/available?start_date=2025-11-10&end_date=2025-11-14")
echo "$response" | head -c 200
echo "..."
if echo "$response" | grep -q "available_slots"; then
    echo "✅ PASS: Returns available slots"
else
    echo "❌ FAIL: Should return available_slots"
fi
echo ""

# Test 4: Create valid appointment (9:00 AM IST)
echo "TEST 4: POST /api/v1/appointments (Valid - 9:00 AM)"
echo "-----------------------------------------"
response=$(curl -s -X POST http://localhost:3001/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "appointment": {
      "name": "Test User",
      "email": "test@example.com",
      "phone": "9876543210",
      "date_time": "2025-11-10T09:00:00+05:30",
      "reason": "Test appointment"
    }
  }')
echo "$response" | head -c 300
if echo "$response" | grep -q "Test User"; then
    echo ""
    echo "✅ PASS: Appointment created successfully"
    appointment_id=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
else
    echo ""
    echo "❌ FAIL: Should create appointment"
fi
echo ""

# Test 5: Create appointment at 4:30 PM (last slot)
echo "TEST 5: POST /api/v1/appointments (Valid - 4:30 PM)"
echo "-----------------------------------------"
response=$(curl -s -X POST http://localhost:3001/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "appointment": {
      "name": "Last Slot User",
      "email": "lastslot@example.com",
      "phone": "9876543211",
      "date_time": "2025-11-10T16:30:00+05:30",
      "reason": "Last slot test"
    }
  }')
if echo "$response" | grep -q "Last Slot User"; then
    echo "✅ PASS: 4:30 PM slot accepted"
else
    echo "❌ FAIL: 4:30 PM slot should be valid"
fi
echo ""

# Test 6: Try to create duplicate appointment (double-booking)
echo "TEST 6: POST /api/v1/appointments (Invalid - Double booking)"
echo "-----------------------------------------"
response=$(curl -s -X POST http://localhost:3001/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "appointment": {
      "name": "Duplicate User",
      "email": "duplicate@example.com",
      "date_time": "2025-11-10T09:00:00+05:30",
      "reason": "Duplicate test"
    }
  }')
if echo "$response" | grep -q "error"; then
    echo "✅ PASS: Double-booking prevented"
else
    echo "❌ FAIL: Should prevent double-booking"
fi
echo ""

# Test 7: Try past appointment
echo "TEST 7: POST /api/v1/appointments (Invalid - Past date)"
echo "-----------------------------------------"
response=$(curl -s -X POST http://localhost:3001/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "appointment": {
      "name": "Past User",
      "email": "past@example.com",
      "date_time": "2025-01-01T09:00:00+05:30",
      "reason": "Past test"
    }
  }')
if echo "$response" | grep -q "past"; then
    echo "✅ PASS: Past date rejected"
else
    echo "❌ FAIL: Should reject past dates"
fi
echo ""

# Test 8: Try weekend appointment
echo "TEST 8: POST /api/v1/appointments (Invalid - Weekend)"
echo "-----------------------------------------"
response=$(curl -s -X POST http://localhost:3001/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "appointment": {
      "name": "Weekend User",
      "email": "weekend@example.com",
      "date_time": "2025-11-09T09:00:00+05:30",
      "reason": "Weekend test"
    }
  }')
if echo "$response" | grep -q "weekday"; then
    echo "✅ PASS: Weekend date rejected"
else
    echo "❌ FAIL: Should reject weekend dates"
fi
echo ""

# Test 9: Try outside business hours (6:00 AM)
echo "TEST 9: POST /api/v1/appointments (Invalid - Before 9 AM)"
echo "-----------------------------------------"
response=$(curl -s -X POST http://localhost:3001/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "appointment": {
      "name": "Early User",
      "email": "early@example.com",
      "date_time": "2025-11-10T06:00:00+05:30",
      "reason": "Early test"
    }
  }')
if echo "$response" | grep -q "9:00 AM"; then
    echo "✅ PASS: Before business hours rejected"
else
    echo "❌ FAIL: Should reject times before 9 AM"
fi
echo ""

# Test 10: Try invalid email
echo "TEST 10: POST /api/v1/appointments (Invalid - Bad email)"
echo "-----------------------------------------"
response=$(curl -s -X POST http://localhost:3001/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "appointment": {
      "name": "Bad Email User",
      "email": "notanemail",
      "date_time": "2025-11-11T09:00:00+05:30",
      "reason": "Email test"
    }
  }')
if echo "$response" | grep -q "error"; then
    echo "✅ PASS: Invalid email rejected"
else
    echo "❌ FAIL: Should reject invalid email"
fi
echo ""

# Test 11: Get all appointments (should have 2)
echo "TEST 11: GET /api/v1/appointments (with data)"
echo "-----------------------------------------"
response=$(curl -s http://localhost:3001/api/v1/appointments)
count=$(echo "$response" | grep -o '"id":' | wc -l)
if [ "$count" -eq 2 ]; then
    echo "✅ PASS: Returns 2 appointments"
else
    echo "❌ FAIL: Should return 2 appointments, got $count"
fi
echo ""

# Test 12: Delete appointment
if [ ! -z "$appointment_id" ]; then
    echo "TEST 12: DELETE /api/v1/appointments/$appointment_id"
    echo "-----------------------------------------"
    response=$(curl -s -X DELETE http://localhost:3001/api/v1/appointments/$appointment_id)
    if echo "$response" | grep -q "cancelled successfully"; then
        echo "✅ PASS: Appointment cancelled"
    else
        echo "❌ FAIL: Should cancel appointment"
    fi
    echo ""
fi

# Test 13: Try to delete non-existent appointment
echo "TEST 13: DELETE /api/v1/appointments/99999 (Invalid ID)"
echo "-----------------------------------------"
response=$(curl -s -X DELETE http://localhost:3001/api/v1/appointments/99999)
if echo "$response" | grep -q "not found"; then
    echo "✅ PASS: Returns 404 for invalid ID"
else
    echo "❌ FAIL: Should return 404"
fi
echo ""

echo "========================================="
echo "TEST SUITE COMPLETE"
echo "========================================="
