# Test Report – Sweet Shop Management System

## Backend Testing

Framework: Pytest  
Approach: Test Driven Development (TDD)

### Test Coverage
- Authentication APIs
  - User registration
  - User login
- Sweet APIs
  - List sweets
  - Authorization check
- Inventory APIs
  - Invalid purchase handling

### Test Files
- test_auth.py
- test_sweets.py
- test_inventory.py

### Status
✔ Core API tests implemented  
✔ Authentication tested  
✔ Authorization verified  

### Notes
Some edge cases (bcrypt password length) were identified and fixed during testing.

---

## Frontend Testing
Manual testing using browser and API responses.

---

## Conclusion
The system follows a modular design with proper automated testing for critical backend functionality.
