# Delivery Order Debug Guide

## Issue

Orders marked as DELIVERED show 0 in Delivery History page.

## Frontend Changes Applied

### 1. **DeliveryHistory.jsx**

- Added manual refresh button to reload orders on-demand
- Auto-reload when page tab becomes visible
- Comprehensive console logging at each step

### 2. **AgentDashboard.jsx**

- Reload orders after OTP verification
- Dependency on auth user changes
- Logs all status updates

### 3. **client.js API Layer**

Enhanced `listDeliveredOrders()` with:

- Multiple endpoint attempts (agent-specific first)
- Fallback to fetch ALL delivered orders
- Client-side filtering by deliveryAgentId
- Numeric status code support (status=5 for DELIVERED)
- Extensive console logging

## What to Check in Browser Console

### After clicking "Verify OTP & Deliver":

1. Look for: `[AGENT_DASHBOARD] Marking order as DELIVERED: <ORDER_ID>`
2. Then: `[API] Updating order status:` with newStatus = 5
3. Then: `[API] Order status update response:` (check if successful)
4. Then: `[AGENT_DASHBOARD] Order marked as DELIVERED, reloading orders...`
5. Final: `[AGENT_DASHBOARD] Orders reloaded. Active: X Delivered: Y`

### Go to Delivery History / History tab:

1. `[DELIVERY_HISTORY] Component mounted, loading delivered orders`
2. `[API] Fetching delivered orders for agent: <AGENT_ID>`
3. `[API] Trying delivered orders endpoint:` (see which ones succeed)
4. `[API] Delivered orders loaded from <ENDPOINT>:` (see raw data)
5. `[API] Parsed orders array:` (see parsed array)
6. `[API] Normalized order 1:` { id, status, restaurant } (see each order)
7. `[API] Returning X delivered orders` (final count)

## Possible Issues & Solutions

### Issue 1: Backend returning empty array

**Sign**: `[API] Parsed orders array: []`

- Backend's delivered orders query might be broken
- Agent ID might not be stored correctly in database

### Issue 2: Status not being saved

**Sign**: Order status shows as something other than "DELIVERED" in logs

- Backend might not be saving orderStatus = 5
- The update might be failing silently

### Issue 3: Agent ID mismatch

**Sign**: `[API] Filtering out order <ID> - agent mismatch`

- The delivered order's deliveryAgentId doesn't match logged-in agent
- Backend needs to assign agent when marking as delivered

## Next Steps

1. Open browser DevTools (F12)
2. Click "Console" tab
3. Perform delivery action (mark order as delivered)
4. Look at console output - compare with the above checklist
5. **Share the relevant console logs** so we can pinpoint the exact issue
