-- SQLite
-- Checking number of users with warning exceptions:
-- SELECT COUNT(email) from User where warning_exception = 1;

-- Check number of users who are active:
SELECT COUNT(email) from User where is_active = 1;

-- Checking number of User_Match entries:
-- SELECT COUNT(id) from User_Match;

-- SQLite
-- SELECT U.email, COUNT(U.email) as num_of_matches from User U
--   LEFT JOIN User_Match UM 
--   ON U.id = UM.user_id
--   WHERE U.is_active = 1
--   GROUP BY U.email
--   ORDER BY num_of_matches DESC;

-- select * from User U LEFT JOIN User_Match UM ON U.id = UM.user_id Limit 10;
-- select * from Match Limit 10;
-- select * from User_Match;

-- select M.id from User U LEFT JOIN User_Match UM ON U.id = UM.user_id LEFT JOIN 
--   Match M ON UM.match_id = M.id Limit 10;

-- select user_id from User_Match WHERE match_id LIMIT 10;
-- select * from User_Match LIMIT 10;

-- select * from User Limit 10;

-- select user_id from User_Match where user_id <> 1 and match_id IN (select id from User_Match where user_id = 1);

-- with alans_matches as (select distinct(match_id) as mid from User_Match where user_id = (SELECT id from User where email="alancodes@gmail.com"))

--   select user_id from User_Match where match_id in alans_matches;

with alans_matches as (select distinct(match_id) as mid from User_Match where user_id = (SELECT id from User where email="alancodes@gmail.com"))

  select user_id from User_Match where match_id in alans_matches;

-- select count(distinct(user_id)) from User_Match where match_id in (select distinct(match_id) from User_Match where user_id = (SELECT id from User where email="recurse@dbalan.in"));


-- select * from User WHERE user_id in 
--   (select user_id from User_Match where match_id in 
--     (select distinct(match_id) from User_Match 
--       where user_id = (SELECT id from User where email="recurse@dbalan.in")
--      )
--     );
