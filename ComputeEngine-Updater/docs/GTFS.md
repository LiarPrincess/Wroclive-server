# agency.txt
agency_id
agency_name
agency_url
agency_timezone
agency_phone
agency_lang

2,"MPK Autobusy","http://www.mpk.wroc.pl","Europe/Warsaw","71 321 72 71","pl"
3,"MPK Tramwaje","http://www.mpk.wroc.pl","Europe/Warsaw","71 321 72 71","pl"

# calendar_dates.txt
service_id
date
exception_type

3,20181101,1
6,20181101,2

# calendar.txt
service_id
monday
tuesday
wednesday
thursday
friday
saturday
sunday
start_date
end_date

4,0,0,0,0,0,0,1,20181013,20181112
8,0,0,0,0,1,0,0,20181013,20181112
6,1,1,1,1,0,0,0,20181013,20181112
3,0,0,0,0,0,1,0,20181013,20181112

# control_stops.txt
variant_id
stop_id

703304,637
703304,668

# feed_info.txt
feed_publisher_name
feed_publisher_url
feed_lang
feed_start_date
feed_end_date

"UM Wrocław","http://www.wroclaw.pl/urzad","pl","20181013","20181112"

# route_types.txt
route_type2_id
route_type2_name

30,"Normalna autobusowa"
31,"Normalna tramwajowa"
34,"Podmiejska autobusowa"
35,"Pospieszna autobusowa"
39,"Strefowa autobusowa"
40,"Nocna autobusowa"

# routes.txt
route_id
agency_id
route_short_name
route_long_name
route_desc
route_type
route_type2_id
valid_from
valid_until

1,3," 1","","POŚWIĘTNE - Żmigrodzka - Trzebnicka - pl. Powstańców Wielkopolskich - Słowiańska - Jedności Narodowej - Nowowiejska - Piastowska - Skłodowskiej-Curie - Wróblewskiego - Olszewskiego - BISKUPIN|BISKUPIN - Wróblewskiego - Skłodowskiej-Curie - Piastowska - Nowowiejska - Jedności Narodowej - Słowiańska - pl. Powstańców Wielkopolskich - Trzebnicka - Żmigrodzka - POŚWIĘTNE",0,31,"2018-10-13","2999-01-01"
2,3," 2","","KRZYKI - Karkonoska - pl. Powstańców Śląskich - Powstańców Śl. - Świdnicka - Piłsudskiego - Kołłątaja - Oławska - pl. Powstańców Warszawy - Wyszyńskiego - Szczytnicka - pl. Grunwaldzki - Skłodowskiej-Curie - Wróblewskiego - Olszewskiego - BISKUPIN|BISKUPIN - Wróblewskiego - pl. Grunwaldzki - Skłodowskiej-Curie - Wyszyńskiego - pl. Powstańców Warszawy - Oławska - Piotra Skargi - Kołłątaja - Piłsudskiego - Powstańców Śl. - Karkonoska - KRZYKI",0,31,"2018-10-13","2999-01-01"
3,3," 3","","LEŚNICA - Średzka - Kosmonautów - Lotnicza - Legnicka - Kazimierza Wlk. - Oławska - Traugutta - Krakowska - Opolska - KSIĘŻE MAŁE|KSIĘŻE MAŁE - Krakowska - Traugutta - Oławska - Kazimierza Wlk. - Legnicka - Lotnicza - Kosmonautów - Średzka - LEŚNICA",0,31,"2018-10-13","2999-01-01"
4,3," 4","","BISKUPIN - Olszewskiego - Wróblewskiego - Skłodowskiej-Curie - pl. Grunwaldzki - pl. Powstańców Warszawy - Oławska - Kazimierza Wlk. - Krupnicza - Sądowa - Grabiszyńska - OPORÓW|OPORÓW - Krupnicza - Kazimierza Wlk. - Oławska - pl. Powstańców Warszawy - pl. Grunwaldzki - Skłodowskiej-Curie - Wróblewskiego - Olszewskiego - BISKUPIN",0,31,"2018-10-13","2999-01-01"
5,3," 5","","KSIĘŻE MAŁE - Opolska - Krakowska - Traugutta - Oławska - Piotra Skargi - Kołłątaja - Piłsudskiego - Grabiszyńska - OPORÓW|OPORÓW - Piłsudskiego - Kołłątaja - Oławska - Traugutta - Krakowska - Opolska - KSIĘŻE MAŁE",0,31,"2018-10-13","2999-01-01"

# shapes.txt
shape_id
shape_pt_lat
shape_pt_lon
shape_pt_sequence

713066,51.111784838632,17.000640048758,23
713695,51.107137355177,16.950818197856,73
713859,51.114543808065,17.003175449981,366

# stop_times.txt
trip_id
arrival_time
departure_time
stop_id
stop_sequence
pickup_type
drop_off_type

3_6521756,08:11:00,08:11:00,1684,0,0,1
3_6521756,08:12:00,08:12:00,1626,1,0,0
3_6521756,08:13:00,08:13:00,1575,2,0,0

# stops.txt
stop_id
stop_code
stop_name
stop_lat
stop_lon

609,24306,"Zacisze",51.1243518300,17.0778218200
3582,11364,"Weigla (Szpital)",51.0773993700,17.0191201400
564,24517,"Bacciarellego",51.1056363100,17.1104913100

# trips.txt
route_id
service_id
trip_id
trip_headsign
direction_id
shape_id
brigade_id
vehicle_id
variant_id

1,3,3_6521756,"POŚWIĘTNE",1,714168,1,28,714168
1,3,3_6521760,"POŚWIĘTNE",1,714168,1,28,714168
1,3,3_6521764,"POŚWIĘTNE",1,714168,1,28,714168
1,3,3_6521768,"POŚWIĘTNE",1,714168,1,28,714168

# variants.txt
variant_id
is_main
equiv_main_variant_id
join_stop_id
disjoin_stop_id

703304,1,,,
703305,1,,,
703308,0,704335,667,
703309,0,704335,,669

# vehicle_types.txt
vehicle_type_id
vehicle_type_name
vehicle_type_description
vehicle_type_symbol

28,"Skoda 16T i 19T","N - Kurs obsługiwany przez tramwaj NISKOPODŁOGOWY.","N"
34,"Pesa Twist 2010","N - Kurs obsługiwany przez tramwaj NISKOPODŁOGOWY.","N"
36,"M - Moderus MF 19 AC(!)","N - Kurs obsługiwany przez tramwaj NISKOPODŁOGOWY.","N"
