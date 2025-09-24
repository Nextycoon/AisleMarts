# Error Code Policy

AisleMarts API follows consistent HTTP error codes across all services (Express + FastAPI).

## Error Code Mapping

### 400 Bad Request
- Missing required headers
- Malformed JSON payload
- Invalid timestamp format
- General request format issues

**Example:**
```json
{
  "error": "missing_header",
  "header": "x-timestamp"
}
```

### 401 Unauthorized  
- HMAC signature verification fails
- Timestamp outside valid window (±5 minutes)
- Invalid authentication credentials

**Example:**
```json
{
  "error": "invalid_signature"
}
```

### 409 Conflict
- Idempotency key replay detected
- Duplicate resource creation attempts

**Example:**
```json
{
  "error": "idempotency_conflict"
}
```

### 422 Unprocessable Entity
- Schema validation fails (body format OK, business rules wrong)
- Invalid field values that pass basic parsing
- Business logic constraint violations

**Example:**
```json
{
  "error": "validation_failed",
  "details": {
    "fieldErrors": {
      "amount": ["Number must be greater than 0"]
    }
  }
}
```

## Implementation Notes

- **Consistent across services**: Both Express.js and FastAPI backends use identical error codes
- **Security first**: Authentication errors (401) take priority over validation errors (422)
- **Client-friendly**: Error messages include actionable information when safe to expose
- **Idempotency protection**: 409 responses include information about the original successful request

## Error Precedence

1. **400** - Bad request format (missing headers, malformed JSON)
2. **401** - Authentication/authorization failures  
3. **409** - Idempotency conflicts
4. **422** - Business validation failures