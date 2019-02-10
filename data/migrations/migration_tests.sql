-- SQLite
-- Checking number of users with warning exceptions:
-- SELECT COUNT(email) from User where warning_exception = 1;

-- Check number of users who are active:
SELECT COUNT(email) from User where is_active = 1;

-- Checking number of User_Match entries:
-- SELECT COUNT(id) from User_Match;