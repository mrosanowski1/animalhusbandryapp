-- Seed enclosures with map positions
-- Longitude = left (x), Latitude = top (y), both as percentages (0-100) relative to the map image
--
-- NOTE: Column names assume EF Core owned-entity convention (Coordinate_Longitude / Coordinate_Latitude).
-- Adjust to match your actual schema if different (e.g. plain Longitude / Latitude).

INSERT INTO Enclosures (Id, Name, Description, Coordinate_Longitude, Coordinate_Latitude)
VALUES
    ('8CEE767B-4C14-42D9-02EF-08DE144D6345', 'A01',        '', 55, 35),
    ('A1B2C3D4-E5F6-7890-ABCD-EF1234567891', 'Dive',       '', 50, 55),
    ('A1B2C3D4-E5F6-7890-ABCD-EF1234567892', 'A03',        '', 52, 62),
    ('A1B2C3D4-E5F6-7890-ABCD-EF1234567893', 'A04',        '', 55, 65),
    ('A1B2C3D4-E5F6-7890-ABCD-EF1234567894', 'NH1',        '', 65, 50),
    ('A1B2C3D4-E5F6-7890-ABCD-EF1234567895', 'Numeric 1-3','', 73, 60),
    ('A1B2C3D4-E5F6-7890-ABCD-EF1234567896', 'Numeric 4',  '', 80, 58),
    ('A1B2C3D4-E5F6-7890-ABCD-EF1234567897', 'A09',        '', 91, 68),
    ('A1B2C3D4-E5F6-7890-ABCD-EF1234567898', 'A11',        '', 94, 70),
    ('A1B2C3D4-E5F6-7890-ABCD-EF1234567899', 'A13',        '', 97, 72);
