-- Assigning region_id to countries based on their regions

-- African Sector (region_id = 1)
UPDATE countries SET region_id = 1 WHERE id IN (
    5, 8, 20, 25, 29, 30, 32, 34, 37, 43, 46, 53, 56, 62, 67, 68, 70, 75, 76,
    77, 95, 100, 103, 104, 108, 110, 112, 114, 115, 116, 123, 124, 128, 129,
    143, 146, 147, 149, 150, 158, 159, 161, 162, 165, 167, 168, 169, 174, 177,
    180, 185, 192, 193, 194
);

-- Asian and the Pacific Sector (region_id = 2)
UPDATE countries SET region_id = 1 WHERE id IN (
    1, 7, 10, 11, 13, 15, 17, 22, 27, 31, 33, 36, 39, 44, 45, 55, 63, 65, 69,
    81, 82, 83, 84, 87, 88, 89, 92, 93, 94, 96, 97, 98, 99, 102, 109, 111, 118,
    121, 125, 126, 131, 132, 134, 135, 137, 153, 163, 164, 166, 173, 175, 176,
    178, 181, 183, 187, 188, 190, 191, 195, 198
);

-- Central and North European Sector (region_id = 3)
UPDATE countries SET region_id = 1 WHERE id IN (
    3, 12, 18, 21, 50, 57, 61, 64, 66, 80, 85, 86, 101, 105, 106, 107, 119,
    130, 133, 140, 142, 144, 151, 152, 170, 171, 184
);

-- Latin American and Caribbean Sector (region_id = 4)
UPDATE countries SET region_id = 1 WHERE id IN (
    6, 9, 14, 16, 19, 23, 26, 38, 42, 47, 49, 51, 52, 54, 58, 71, 73, 74, 78,
    79, 91, 127, 136, 138, 139, 148, 154, 156, 157, 172, 179, 186, 189
);

-- North American Sector (region_id = 5)
UPDATE countries SET region_id = 1 WHERE id IN (
    35, 60, 117
);

-- South European Sector (region_id = 6)
UPDATE countries SET region_id = 1 WHERE id IN (
    2, 4, 24, 28, 40, 41, 48, 59, 72, 90, 113, 120, 122, 141, 145, 155, 160,
    182, 196, 197
);