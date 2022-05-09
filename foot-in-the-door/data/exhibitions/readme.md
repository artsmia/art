# Exhibition data definitions

This directory hosts data on Mia Exhibitions that expands what's possible.

Each exhibition starts with base data from Mia's API[1][2]. There are two
complementary ways to provide additional data:

[1] https://cdn.dx.artsmia.org/exhibitions/2/2882.json
[2] https://cdn.dx.artsmia.org/exhibitions/2/2830.json

## TMS Exported Data

Complex exhibitions can be built out in TMS with panels, subpanels, and labels.
This is a work-in-progress, the first example being "Todd Webb"[3]. Data is
formulated in TMS by registrars or the TMS administrator, and exported to
a spreadsheet[4], which is then converted to JSON using `csvjson` and named
`:exhibitionId.json`.

[3] https://collections.artsmia.org/exhibitions/2830/todd-webb-in-africa
[4] https://docs.google.com/spreadsheets/d/18q3rrHaI9L1mJKCn0uBbesnEHBRUWTMQ1uYyWzF15K0/edit?skip_itp2_check=true#gid=0

## Additional Markdown Data

Data can also be provided as a markdown file with "front matter". "Labor Camp"
(`data/exhibitions/2882.md`) is a good example. This is an easy way to
configure how the exhibition should be presented online, and allows for
different exhibitions to take on different formats.
