-- create table
create table app_user
(
  user_id           bigint not null,
  user_name         varchar(36) not null,
  encryted_password varchar(128) not null,
  enabled           bit not null 
) ;
--  
alter table app_user
  add constraint app_user_pk primary key (user_id);
 
alter table app_user
  add constraint app_user_uk unique (user_name);
 
 
-- create table
create table app_role
(
  role_id   bigint not null,
  role_name varchar(30) not null
) ;
--  
alter table app_role
  add constraint app_role_pk primary key (role_id);
 
alter table app_role
  add constraint app_role_uk unique (role_name);
 
 
-- create table
create table user_role
(
  id      bigint not null,
  user_id bigint not null,
  role_id bigint not null
);
--  
alter table user_role
  add constraint user_role_pk primary key (id);
 
alter table user_role
  add constraint user_role_uk unique (user_id, role_id);
 
alter table user_role
  add constraint user_role_fk1 foreign key (user_id)
  references app_user (user_id);
 
alter table user_role
  add constraint user_role_fk2 foreign key (role_id)
  references app_role (role_id);
 
 
-- used by spring remember me api.  
create table persistent_logins (
 
    username varchar(64) not null,
    series varchar(64) not null,
    token varchar(64) not null,
    last_used timestamp not null,
    primary key (series)
     
);
 
/*  password is __ENCRYPTED_PASSWORD__ */
insert into app_user (user_id, user_name, encryted_password, enabled)
values (2, 'user', '$2a$10$Gph22Hnr8qSUN4UQK/cAVuMuE0atmKFkKSTLDl2WczS6BQqgGyRPq', 1);

insert into app_user (user_id, user_name, encryted_password, enabled)
values (1, 'admin', '$2a$10$Gph22Hnr8qSUN4UQK/cAVuMuE0atmKFkKSTLDl2WczS6BQqgGyRPq', 1);
 

 
insert into app_role (role_id, role_name)
values (1, 'ROLE_ADMIN');
 
insert into app_role (role_id, role_name)
values (2, 'ROLE_USER');
 

 
insert into user_role (id, user_id, role_id)
values (1, 1, 1);
 
insert into user_role (id, user_id, role_id)
values (2, 1, 2);
 
insert into user_role (id, user_id, role_id)
values (3, 2, 2);
