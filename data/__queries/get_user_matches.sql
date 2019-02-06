-- SQLite
-- ===== FINDS USERS TO MATCH FOR TODAY: WORKS =====
-- SELECT * FROM User U
-- WHERE U.coffee_days like '%1%'
-- AND U.skip_next_match <> 1;

-- ===== FINDS USERS TO MATCH FOR TODAY by num of previous matches: WORKS =====
SELECT U.*, count(U.email) as num_matches FROM User U
LEFT JOIN User_Match UM
ON U.id = UM.user_id
LEFT JOIN Match M 
ON UM.match_id = M.id
WHERE U.coffee_days like '%1%'
AND U.skip_next_match <> 1
GROUP BY U.email
ORDER BY num_matches desc;

-- ====== Sorting my users with matches ======
-- TODO: Only Count user's match if the other user is in that match
-- SELECT U.email, M.date, count(U.email) as num_user FROM User U
-- LEFT JOIN User_Match UM
-- ON U.id = UM.user_id
-- LEFT JOIN Match M 
-- ON UM.match_id = M.id
-- WHERE U.coffee_days like '%1%'
-- AND U.skip_next_match <> 1
-- GROUP BY U.email
-- ORDER BY num_user desc;

-- UPDATE User
-- SET skip_next_match = 1
-- WHERE email = 'a@gmail.com';