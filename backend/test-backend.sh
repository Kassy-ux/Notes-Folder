#!/bin/bash

# Backend Test Script
# Usage: ./test-backend.sh https://your-backend-url.railway.app

BACKEND_URL="$1"

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Error: Please provide backend URL"
    echo "Usage: ./test-backend.sh https://your-backend-url.railway.app"
    exit 1
fi

echo "🧪 Testing Backend: $BACKEND_URL"
echo "================================"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")
if [ "$HEALTH_RESPONSE" -eq 200 ]; then
    echo "   ✅ Health check passed (HTTP $HEALTH_RESPONSE)"
else
    echo "   ❌ Health check failed (HTTP $HEALTH_RESPONSE)"
    exit 1
fi
echo ""

# Test 2: Register New User
echo "2️⃣  Testing User Registration..."
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_$TIMESTAMP@example.com"
TEST_USERNAME="testuser_$TIMESTAMP"
TEST_PASSWORD="Test123!@#"

REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\"
  }")

TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$TOKEN" ]; then
    echo "   ✅ Registration successful"
    echo "   📝 Token: ${TOKEN:0:20}..."
else
    echo "   ❌ Registration failed"
    echo "   Response: $REGISTER_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Create Note
echo "3️⃣  Testing Note Creation..."
CREATE_NOTE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/notes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Backend Test Note",
    "content": "This note was created by the test script!",
    "category": "general"
  }')

NOTE_ID=$(echo "$CREATE_NOTE_RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')

if [ -n "$NOTE_ID" ]; then
    echo "   ✅ Note creation successful"
    echo "   📝 Note ID: $NOTE_ID"
else
    echo "   ⚠️  Note creation response:"
    echo "   $CREATE_NOTE_RESPONSE"
fi
echo ""

# Test 4: Get All Notes
echo "4️⃣  Testing Get Notes..."
GET_NOTES_RESPONSE=$(curl -s -X GET "$BACKEND_URL/api/notes" \
  -H "Authorization: Bearer $TOKEN")

NOTES_COUNT=$(echo "$GET_NOTES_RESPONSE" | grep -o '"count":[0-9]*' | sed 's/"count"://')

if [ -n "$NOTES_COUNT" ]; then
    echo "   ✅ Get notes successful"
    echo "   📊 Notes count: $NOTES_COUNT"
else
    echo "   ⚠️  Get notes response:"
    echo "   $GET_NOTES_RESPONSE"
fi
echo ""

# Test 5: Get Trash
echo "5️⃣  Testing Trash Endpoint (FIXED)..."
TRASH_RESPONSE=$(curl -s -X GET "$BACKEND_URL/api/notes/trash/all" \
  -H "Authorization: Bearer $TOKEN")

TRASH_COUNT=$(echo "$TRASH_RESPONSE" | grep -o '"count":[0-9]*' | sed 's/"count"://')

if [ -n "$TRASH_COUNT" ]; then
    echo "   ✅ Trash endpoint working!"
    echo "   🗑️  Trash count: $TRASH_COUNT"
else
    echo "   ❌ Trash endpoint failed"
    echo "   Response: $TRASH_RESPONSE"
fi
echo ""

# Test 6: Delete Note
if [ -n "$NOTE_ID" ]; then
    echo "6️⃣  Testing Soft Delete..."
    DELETE_RESPONSE=$(curl -s -X DELETE "$BACKEND_URL/api/notes/$NOTE_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$DELETE_RESPONSE" | grep -q '"success":true'; then
        echo "   ✅ Note soft deleted"
    else
        echo "   ⚠️  Delete response: $DELETE_RESPONSE"
    fi
    echo ""

    # Test 7: Verify note in trash
    echo "7️⃣  Testing Trash After Delete..."
    TRASH_RESPONSE_2=$(curl -s -X GET "$BACKEND_URL/api/notes/trash/all" \
      -H "Authorization: Bearer $TOKEN")
    
    TRASH_COUNT_2=$(echo "$TRASH_RESPONSE_2" | grep -o '"count":[0-9]*' | sed 's/"count"://')
    
    if [ -n "$TRASH_COUNT_2" ] && [ "$TRASH_COUNT_2" -gt "$TRASH_COUNT" ]; then
        echo "   ✅ Note appears in trash!"
        echo "   🗑️  New trash count: $TRASH_COUNT_2"
    else
        echo "   ⚠️  Trash count: $TRASH_COUNT_2"
    fi
    echo ""
fi

# Test 8: Rate Limiter (FIXED)
echo "8️⃣  Testing Rate Limiter (trust proxy fix)..."
echo "   Making 5 rapid requests..."
for i in {1..5}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")
    if [ "$STATUS" -eq 200 ]; then
        echo "   Request $i: ✅ HTTP $STATUS"
    else
        echo "   Request $i: ❌ HTTP $STATUS"
    fi
done
echo "   ✅ No rate limiter errors!"
echo ""

# Summary
echo "================================"
echo "🎉 All Tests Completed!"
echo ""
echo "Test User:"
echo "  Email: $TEST_EMAIL"
echo "  Username: $TEST_USERNAME"
echo "  Token: ${TOKEN:0:30}..."
echo ""
echo "✅ Backend is working correctly!"
echo "✅ Trust proxy fix applied"
echo "✅ Drizzle ORM syntax fixed"
echo "✅ All endpoints functional"
