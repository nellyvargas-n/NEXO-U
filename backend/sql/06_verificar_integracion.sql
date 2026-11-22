-- SOLO LECTURA: verificaciones para Neon Console
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND (
  (table_name IN ('credentials','enrollments') AND column_name IN ('student_id','student_user_id'))
  OR (table_name='opportunities' AND column_name='is_demo')
  OR (table_name='courses' AND column_name='credential_level'))
ORDER BY table_name, column_name;

-- Oportunidades verificadas y vigentes (siembra demo: is_demo=true)
SELECT o.id, o.title, o.deadline, o.is_demo, org.name AS organization_name
FROM opportunities AS o
JOIN organization_opportunities AS oo ON oo.opportunity_id=o.id
JOIN organizations AS org ON org.id=oo.organization_id
WHERE org.verified = TRUE AND o.deadline >= CURRENT_DATE
ORDER BY o.deadline;
