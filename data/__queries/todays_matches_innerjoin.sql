with todayMatches as (
  SELECT
    U.*,
    U.id as u_id,
    count (UM.user_id) as num_matches,
    M.id as mid
  FROM
    User U
    LEFT JOIN User_Match UM ON U.id = UM.user_id
    LEFT JOIN Match M ON UM.match_id = M.id
  WHERE
    U.coffee_days LIKE '%${dayToSearch}%'
    AND U.skip_next_match <> 1
  GROUP BY
    UM.user_id
  ORDER BY
    num_matches desc
),
totalMatches as (
  select
    *
  from
    todayMatches TM2
    INNER JOIN User_Match UM2 ON TM2.id = UM2.user_id
    INNER JOIN Match M2 ON UM2.match_id = M2.id
)
SELECT
  *
FROM
  totalMatches TM3
  INNER JOIN totalMatches TM4 ON TM3.match_id = TM4.match_id
  AND TM3.user_id != TM4.user_id
ORDER BY
  TM3.email,
  TM3.date