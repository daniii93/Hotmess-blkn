-- HotMess local services: strict customer/provider role separation and business-category rules.

alter table public.local_service_categories
  add column if not exists business_keywords text[] not null default '{}';

alter table public.local_service_projects
  add column if not exists requester_business_profile_id uuid references public.business_profiles(id),
  add column if not exists request_type text not null default 'private'
    check (request_type in ('private','company','subcontract')),
  add column if not exists allow_same_category_subcontract boolean not null default false,
  add column if not exists subcontract_scope text;

create index if not exists idx_local_service_projects_requester_business
  on public.local_service_projects(requester_business_profile_id, request_type);

update public.local_service_categories
set business_keywords = array['maler','painting','paint','anstreicher','fassade','lackierer']
where slug = 'maler';

update public.local_service_categories
set business_keywords = array['heizung','installateur','installationen','sanitaer','sanitär','haustechnik','shk','gas','wasser']
where slug in ('heizung','installateur','bad');

update public.local_service_categories
set business_keywords = array['elektriker','elektro','strom','photovoltaik','pv','solar']
where slug in ('elektriker','photovoltaik');

update public.local_service_categories
set business_keywords = array['dach','dachdecker','spengler']
where slug = 'dach';

update public.local_service_categories
set business_keywords = array['fenster','glas','tuer','türen','tischler']
where slug in ('fenster','tischler');

update public.local_service_categories
set business_keywords = array['boden','parkett','estrich','fliesen','fliesenleger']
where slug in ('boden','fliesen');

update public.local_service_categories
set business_keywords = array['garten','landschaft','gaertner','gärtner']
where slug = 'garten';

update public.local_service_categories
set business_keywords = array['reinigung','cleaning','putz','gebaeudereinigung','gebäudereinigung']
where slug = 'reinigung';

update public.local_service_categories
set business_keywords = array['umzug','transport','spedition']
where slug = 'umzug';

update public.local_service_categories
set business_keywords = array['kueche','küche','moebel','möbel','tischler']
where slug = 'kueche';

update public.local_service_categories
set business_keywords = array['trockenbau','gips','innenausbau']
where slug = 'trockenbau';

update public.local_service_categories
set business_keywords = array['schlosser','metall','stahl']
where slug = 'schlosser';

update public.local_service_categories
set business_keywords = array['auto','kfz','mechaniker','werkstatt']
where slug = 'auto-service';

update public.local_service_categories
set business_keywords = array['it','software','computer','web','technik']
where slug = 'it-service';

update public.local_service_categories
set business_keywords = array['fotograf','foto','video']
where slug = 'fotograf';

update public.local_service_categories
set business_keywords = array['dj','musik','event','veranstaltung']
where slug in ('dj','eventservice');

update public.local_service_categories
set business_keywords = array['security','sicherheit','schutz']
where slug = 'security';
