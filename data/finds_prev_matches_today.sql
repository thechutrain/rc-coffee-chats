-- SQLite
   SELECT User.*
      FROM User
      LEFT Join User_Match
        ON User.id = User_Match.user_id
      LEFT JOIN Match
        ON User_Match.match_id = Match.id
      WHERE User_Match.user_id <> 1
      AND User.coffee_days LIKE '%2%'
      AND User.skip_next_match <> 1
      AND User_Match.match_id in (
        SELECT Match.id
        FROM User
        LEFT JOIN User_Match
          ON User.id = User_Match.user_id
        LEFT JOIN Match
          ON User_Match.match_id = Match.id
        WHERE User.id = 1 
       );