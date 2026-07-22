UPDATE t_p57647769_pwa_login_app.admin_tasks
SET note = REPLACE(note, 'https://zavdoc.ru/legal-drafts.md', 'Читать: https://zavdoc.ru/legal · Скачать Word: https://zavdoc.ru/legal-drafts.doc')
WHERE note LIKE '%legal-drafts.md%';

UPDATE t_p57647769_pwa_login_app.admin_tasks
SET note = REPLACE(note, 'https://zavdoc.ru/legal-explained.md', 'https://zavdoc.ru/legal-explained.doc')
WHERE note LIKE '%legal-explained.md%';