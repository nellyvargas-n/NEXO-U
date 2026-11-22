-- SOLO LECTURA: comprobar esquema NEXO U v1.4.
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema='public'
  AND ((table_name='auth_attempts' AND column_name IN ('id','key_hash','created_at'))
  OR (table_name='password_reset_tokens' AND column_name IN ('id','user_id','token_hash','expires_at','used_at'))
  OR (table_name='credentials' AND column_name='student_user_id')
  OR (table_name='enrollments' AND column_name='student_user_id')
  OR (table_name='opportunities' AND column_name='is_demo'))
ORDER BY table_name,column_name;
