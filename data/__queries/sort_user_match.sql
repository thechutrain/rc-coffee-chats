-- SQLite
SELECT user_id, count(user_id) as num_user 
FROM User_Match 
group by user_id order by num_user desc limit 5;

-- SELECT user_id, count(user_id) as num_user 
-- FROM User_Match 
-- LEFT JOIN User
--   ON User_Match.user_id

-- group by user_id order by num_user desc limit 5;
