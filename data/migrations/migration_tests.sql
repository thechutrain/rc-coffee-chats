-- SQLite
-- Checking number of users with warning exceptions:
-- SELECT COUNT(email) from User where warning_exception = 1;

-- Check number of users who are active:
-- SELECT COUNT(email) from User where is_active = 1;

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

-- with alans_matches as (select distinct(match_id) as mid from User_Match where user_id = (SELECT id from User where email="alancodes@gmail.com"))

-- select count(user_id) from User_Match where match_id in alans_matches and user_id <> (SELECT id from User where email="alancodes@gmail.com");

-- select count(distinct(user_id)) from User_Match where match_id in (select distinct(match_id) from User_Match where user_id = (SELECT id from User where email="recurse@dbalan.in"));


-- select * from User WHERE user_id in 
--   (select user_id from User_Match where match_id in 
--     (select distinct(match_id) from User_Match 
--       where user_id = (SELECT id from User where email="recurse@dbalan.in")
--      )
--     );


-- =============== WORKS ===================
-- GETS THE NUMBER OF MATCHES YOU've HAD:

-- with alans_matches as (select distinct(match_id) as mid from User_Match where user_id = (SELECT id from User where email="alancodes@gmail.com"))

-- select count(user_id) from User_Match where match_id in alans_matches and user_id <> (SELECT id from User where email="alancodes@gmail.com");

-- =============== WORKS ===================
-- GETS THE USER NAMES OF YOUR MATCHES
select U.email from User U WHERE U.id in (
  with alans_matches as (select distinct(match_id) as mid from User_Match UM where UM.user_id = (SELECT id from User where email="alancodes@gmail.com"))

  select UM.user_id from User_Match UM where UM.match_id in alans_matches and U.id <> (SELECT id from User where email="alancodes@gmail.com")
);

-- SELECT U.id, U.email, U.full_name, Match.date
--       FROM User U
--       LEFT Join User_Match
--         ON U.id = User_Match.user_id
--       LEFT JOIN Match
--         ON User_Match.match_id = Match.id
--       WHERE User_Match.user_id <> ${targetUserId}
--       AND User_Match.match_id in (
--         SELECT Match.id
--         FROM User
--         LEFT JOIN User_Match
--           ON User.id = User_Match.user_id
--         LEFT JOIN Match
--           ON User_Match.match_id = Match.id
--         WHERE User.id = ${targetUserId}
--        )

-- =============== TODO ===================


