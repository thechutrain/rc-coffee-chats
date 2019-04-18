-- ========= WORKS ==============
-- not getting partners email though?
-- with todayMatches as (SELECT U.*,  U.id as u_id, count (UM.user_id) as num_matches, M.id as mid FROM User U
--         LEFT JOIN User_Match UM
--         ON U.id = UM.user_id
--         LEFT JOIN Match M 
--         ON UM.match_id = M.id
--         WHERE U.coffee_days LIKE '%1%'
--         AND U.skip_next_match <> 1
--         GROUP BY UM.user_id
--         ORDER BY num_matches desc),

-- totalMatches as (select * from todayMatches TM2
-- 		INNER JOIN User_Match UM2
-- 		ON TM2.id = UM2.user_id
-- 		INNER JOIN Match M2
-- 		ON UM2.match_id = M2.id)
-- SELECT * FROM totalMatches TM3
-- 	INNER JOIN totalMatches TM4
-- 	ON TM3.match_id = TM4.match_id
-- 	AND TM3.user_id != TM4.user_id
-- 	ORDER BY TM3.email, TM3.date;



        -- ========== Round two ============

-- with UsersToMatch as (SELECT U.*, count (UM.user_id) as num_matches FROM User U
--         LEFT JOIN User_Match UM
--         ON U.id = UM.user_id
--         LEFT JOIN Match M 
--         ON UM.match_id = M.id
--         WHERE U.coffee_days LIKE '%1%'
--         AND U.skip_next_match <> 1
--         GROUP BY UM.user_id
--         ORDER BY num_matches desc),
-- todayUserMatches as (select * from UsersToMatch UTM
-- 		INNER JOIN User_Match UM2
-- 		ON UTM.id = UM2.user_id
-- 		INNER JOIN Match M2
-- 		ON UM2.match_id = M2.id)

-- SELECT * FROM todayUserMatches TUM1
-- 	INNER JOIN todayUserMatches TUM2
-- 	ON TUM1.match_id = TUM2.match_id
-- 	AND TUM1.user_id != TUM2.user_id
-- 	ORDER BY TUM1.email, TUM1.date
--         LIMIT 5;

-- todayUserMatches:
        -- id: 1, user_id, match_id, id: 2, date


-- ============= GET PREV MATCHES ============
SELECT U.id, U.email, U.full_name, Match.date
      FROM User U
      LEFT Join User_Match
        ON U.id = User_Match.user_id
      LEFT JOIN Match
        ON User_Match.match_id = Match.id
      WHERE User_Match.user_id <> 1
      AND U.coffee_days LIKE '%1%'
      AND User_Match.match_id in (
        SELECT Match.id
        FROM User
        LEFT JOIN User_Match
          ON User.id = User_Match.user_id
        LEFT JOIN Match
          ON User_Match.match_id = Match.id
        WHERE User.id = 1
       );