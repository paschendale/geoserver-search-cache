select 'CAD_Geocodificacao' table_name,
'inscricao' column_name,
inscricao AS attribute,
'text' AS type,
id AS original_id,
row_to_json("CAD_Geocodificacao")::text AS original_row
from dados."CAD_Geocodificacao"
UNION
select 'CAD_Geocodificacao' table_name,
'proprietario_' column_name,
proprietario_ AS attribute,
'text' AS type,
id AS original_id,
row_to_json("CAD_Geocodificacao")::text AS original_row
from dados."CAD_Geocodificacao"
UNION
select 'CAD_Geocodificacao' table_name,
'cpf' column_name,
cpf AS attribute,
'text' AS type,
id AS original_id,
row_to_json("CAD_Geocodificacao")::text AS original_row
from dados."CAD_Geocodificacao"
UNION
select 'CAD_Lote' table_name,
'inscricao_lote' column_name,
inscricao_lote AS attribute,
'text' AS type,
id AS original_id,
row_to_json("CAD_Lote")::text AS original_row
from dados."CAD_Lote"
UNION
select 'CAD_Edificacao' table_name,
'inscricao' column_name,
inscricao AS attribute,
'text' AS type,
id AS original_id,
row_to_json("CAD_Edificacao")::text AS original_row
from disponibilizacao."CAD_Edificacao"
UNION
select 'CAD_Secao_Logradouro' table_name,
'tipo' column_name,
tipo AS attribute,
'text' AS type,
id AS original_id,
row_to_json("CAD_Secao_Logradouro")::text AS original_row
from disponibilizacao."CAD_Secao_Logradouro"
UNION
select 'CAD_Secao_Logradouro' table_name,
'nome_logradouro' column_name,
nome_logradouro AS attribute,
'text' AS type,
id AS original_id,
row_to_json("CAD_Secao_Logradouro")::text AS original_row
from disponibilizacao."CAD_Secao_Logradouro"
UNION
select 'CAD_Secao_Logradouro' table_name,
'codigo' column_name,
codigo::text AS attribute,
'integer' AS type,
id AS original_id,
row_to_json("CAD_Secao_Logradouro")::text AS original_row
from disponibilizacao."CAD_Secao_Logradouro"
UNION
select 'CAD_Secao_Logradouro' table_name,
'secao_e' column_name,
secao_e::text AS attribute,
'integer' AS type,
id AS original_id,
row_to_json("CAD_Secao_Logradouro")::text AS original_row
from disponibilizacao."CAD_Secao_Logradouro"
UNION
select 'CAD_Secao_Logradouro' table_name,
'secao_d' column_name,
secao_d::text AS attribute,
'integer' AS type,
id AS original_id,
row_to_json("CAD_Secao_Logradouro")::text AS original_row
from disponibilizacao."CAD_Secao_Logradouro"