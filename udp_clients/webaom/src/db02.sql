CREATE TABLE vtb (ver integer default 0);
ALTER TABLE job MODIFY COLUMN ed2k VARCHAR(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;
ALTER TABLE file DROP COLUMN censored;
ALTER TABLE job RENAME TO jtb;
ALTER TABLE file RENAME TO ftb;
ALTER TABLE anime RENAME TO atb;
ALTER TABLE `group` RENAME TO gtb;
ALTER TABLE episode RENAME TO etb;
ALTER TABLE dir RENAME TO dtb;
ALTER TABLE user RENAME TO utb;
DROP TABLE mylist;
INSERT INTO vtb VALUES (0);
INSERT INTO utb VALUES (1,'def_user');