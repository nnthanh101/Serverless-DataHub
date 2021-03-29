DROP TABLE IF EXISTS cities;
CREATE TABLE cities(id serial PRIMARY KEY, name VARCHAR(255), population integer);

INSERT INTO cities(name, population) VALUES('Hanoi', 432000);
INSERT INTO cities(name, population) VALUES('Hochiminh', 1759000);
INSERT INTO cities(name, population) VALUES('Danang', 1280000);
INSERT INTO cities(name, population) VALUES('Cantho', 1748000);
INSERT INTO cities(name, population) VALUES('Nhatrang', 3971000);
INSERT INTO cities(name, population) VALUES('Quynhon', 8550000);
INSERT INTO cities(name, population) VALUES('Haiphong', 464000);
INSERT INTO cities(name, population) VALUES('Vungtau', 3671000);