// See:
// https://www.google.com/maps/d/edit?mid=1_Ifse-0qIgk8K_amfbe330kvuJPoGelc&usp=sharing

export const borekVehicleIds = new Set([
  // Left building:
  '2710', '3106', '3104', '3121', '2715', '3005', '3101', '3109', '3003',
  // Right building:
  '3114', '3105',

  // Outside building - left:
  '3112', '2714', '3015', '3130', '3117',
  // Outside building - top:
  '3010', '2386', '3129', '2726', '2704', '2912', '3110', '2724', '3108', '2720',
  // Outside building - bottom:
  '2705', '3116',

  // Near road - top:
  '3120', '3111',
  // Near road - bottom:
  '3017', '2712', '3008', '3125', '3009', '2324'
]);

export const michalczewskiVehicleIds = new Set([
  // Top-left:
  '4412', '4407', '4406', '4503', '4611',
  // Middle:
  '4614', '4637', '4639', '4600',
  // Top:
  '4603', '4601', '4619', '4641', '4607',
  // Right:
  '4642', '4616', '4623', '4604', '4608', '4602',
  // Bottom:
  '4416', '4630', '4411'
]);

export const gajVehicleIds = new Set([
  // Outdoor:
  '2378', '2809', '2276', '3208',
  // Building:
  '2813', '2484', '2920', '3206', '2922', '2240', '3207'
]);

export const olbinVehicleIds = new Set([
  // Building:
  '2237', '2258', '2401', '2228', '2420',
  // Outside building - top:
  '2550', '2252', '2522', '2334', '2288', '2400', '2464', '2430', '2380',
  // Outside building - bottom:
  '2350', '2468', '2322', '2498', '2442', '2312', '2206', '2316',
  // Street - right:
  '2544', '2478', '2218'
]);

export const obornickaVehicleIds = new Set([
  // Bottom - outside building - top:
  '5612', '5610', '8461', '8418', '8455',
  // Bottom - outside building - right:
  '8122', '8127', '8145', '8142',
  '8450', '8334', '8433', '8472',
  '5609', '5603', '5604', '5601',
  // Bottom - outside building - bottom:
  '8141', '7025', '8428', '7307',
  // Bottom - inside building:
  '7334', '8332',

  // Top - horizontal road:
  '7417', '5401', '7314',
  // Top - left side:
  '7037', '8120', '5406', '7325', '7335', '5442',
  // Top - left side - road:
  '5418',
  // Top - 1st line
  '7416', '8342', '8124', '7033', '7031', '7022', '7017', '7018', '7015', '7354', '7030', '7026', '7345',
  '7329', '7326', '7320', '7310', '7308', '7306', '7304', '7309',
  // Top - 2nd line
  '8341', '8339', '8335', '8333', '8331', '8056', '8326', '8327',
  '8315', '8314', '8309', '8311', '8307',
  // Top - 3rd line
  '8329', '5431', '5430', '5427', '5420', '5416',
  '5405', '5403',
  // Top - top parking
  '8136', '8135', '8406', '8407', '7024'
]);

export interface Entry {
  sideNumber: string;
  line: string;
  lat: number;
  lng: number;
  updateDate: string;
}

export const vehicles: Entry[] = [
  { sideNumber: '2206', line: '1', lat: 51.12394714, lng: 17.04112244, updateDate: '2020-10-01 20:41:24' },
  { sideNumber: '2468', line: '2', lat: 51.12417984, lng: 17.04194069, updateDate: '2020-10-01 19:02:28' },
  { sideNumber: '2218', line: '2', lat: 51.12400055, lng: 17.04249001, updateDate: '2020-10-01 20:42:31' },
  { sideNumber: '2710', line: '2', lat: 51.07872772, lng: 17.00358772, updateDate: '2020-10-01 22:37:06' },
  { sideNumber: '2912', line: '2', lat: 51.07915497, lng: 17.00549316, updateDate: '2020-10-01 23:10:14' },
  { sideNumber: '2486', line: '3', lat: 51.12359238, lng: 17.04071617, updateDate: '2020-10-01 23:04:03' },
  { sideNumber: '3207', line: '3', lat: 51.08786392, lng: 17.02831078, updateDate: '2020-10-01 23:41:34' },
  { sideNumber: '2813', line: '3', lat: 51.08852768, lng: 17.02852821, updateDate: '2020-10-02 0:04:26' },
  { sideNumber: '3206', line: '3', lat: 51.08822632, lng: 17.02876472, updateDate: '2020-10-02 0:34:14' },
  { sideNumber: '2704', line: '4', lat: 51.07922745, lng: 17.00496864, updateDate: '2020-10-01 10:06:58' },
  { sideNumber: '2276', line: '4', lat: 51.08766556, lng: 17.02915192, updateDate: '2020-10-01 21:09:41' },
  { sideNumber: '2478', line: '4', lat: 51.12390518, lng: 17.04223633, updateDate: '2020-10-01 22:47:19' },
  { sideNumber: '2920', line: '4', lat: 51.08843231, lng: 17.02855301, updateDate: '2020-10-02 0:04:54' },
  { sideNumber: '2380', line: '4', lat: 51.12384796, lng: 17.04062462, updateDate: '2020-10-02 2:06:57' },
  { sideNumber: '2252', line: '5', lat: 51.12540054, lng: 17.04100609, updateDate: '2020-10-01 20:58:53' },
  { sideNumber: '2378', line: '5', lat: 51.08877182, lng: 17.02927589, updateDate: '2020-10-01 23:10:14' },
  { sideNumber: '2564', line: '5', lat: 51.11890793, lng: 17.04201508, updateDate: '2020-10-01 23:11:27' },
  { sideNumber: '3009', line: '5', lat: 51.07808685, lng: 17.00701714, updateDate: '2020-10-01 23:17:22' },
  { sideNumber: '2705', line: '5', lat: 51.07847214, lng: 17.00552368, updateDate: '2020-10-02 0:03:00' },
  { sideNumber: '2550', line: '7', lat: 51.12492752, lng: 17.03952217, updateDate: '2020-10-01 20:11:39' },
  { sideNumber: '2258', line: '7', lat: 51.12466049, lng: 17.04154778, updateDate: '2020-10-01 23:37:11' },
  { sideNumber: '2334', line: '7', lat: 51.12533188, lng: 17.04117775, updateDate: '2020-10-02 0:06:04' },
  { sideNumber: '3010', line: '7', lat: 51.07946014, lng: 17.00429916, updateDate: '2020-10-02 0:23:53' },
  { sideNumber: '2420', line: '7', lat: 51.12440491, lng: 17.04120255, updateDate: '2020-10-02 1:57:37' },
  { sideNumber: '2401', line: '8', lat: 51.12462616, lng: 17.04137993, updateDate: '2020-10-01 6:47:39' },
  { sideNumber: '2268', line: '8', lat: 51.1235466, lng: 17.04014587, updateDate: '2020-10-01 18:29:35' },
  { sideNumber: '2416', line: '8', lat: 51.12360001, lng: 17.04049873, updateDate: '2020-10-01 23:38:31' },
  { sideNumber: '2484', line: '9', lat: 51.08852005, lng: 17.02859688, updateDate: '2020-10-01 18:14:07' },
  { sideNumber: '2240', line: '9', lat: 51.08788681, lng: 17.02830124, updateDate: '2020-10-01 19:03:42' },
  { sideNumber: '2809', line: '9', lat: 51.08789444, lng: 17.02924538, updateDate: '2020-10-01 23:45:52' },
  { sideNumber: '2288', line: '9', lat: 51.12501907, lng: 17.04161072, updateDate: '2020-10-02 0:02:16' },
  { sideNumber: '2442', line: '10', lat: 51.12400818, lng: 17.04150963, updateDate: '2020-10-01 21:04:48' },
  { sideNumber: '2228', line: '10', lat: 51.12458801, lng: 17.0413208, updateDate: '2020-10-01 21:19:49' },
  { sideNumber: '3205', line: '10', lat: 51.08937836, lng: 17.02902794, updateDate: '2020-10-01 21:33:41' },
  { sideNumber: '2464', line: '10', lat: 51.12469864, lng: 17.04171753, updateDate: '2020-10-02 0:14:09' },
  { sideNumber: '2237', line: '10', lat: 51.12469101, lng: 17.04145432, updateDate: '2020-10-02 0:25:37' },
  { sideNumber: '2386', line: '11', lat: 51.07938766, lng: 17.00409126, updateDate: '2020-10-01 18:46:25' },
  { sideNumber: '2720', line: '11', lat: 51.0790329, lng: 17.00580788, updateDate: '2020-10-01 20:57:38' },
  { sideNumber: '2712', line: '11', lat: 51.0781517, lng: 17.00727463, updateDate: '2020-10-01 23:25:05' },
  { sideNumber: '2715', line: '11', lat: 51.07880783, lng: 17.00465775, updateDate: '2020-10-02 0:39:03' },
  { sideNumber: '2724', line: '11', lat: 51.07916641, lng: 17.00581169, updateDate: '2020-10-02 2:07:01' },
  { sideNumber: '2312', line: '15', lat: 51.12408447, lng: 17.04133606, updateDate: '2020-10-01 17:20:08' },
  { sideNumber: '2316', line: '15', lat: 51.12390518, lng: 17.04111671, updateDate: '2020-10-01 23:27:21' },
  { sideNumber: '2322', line: '16', lat: 51.12406158, lng: 17.04197884, updateDate: '2020-10-01 23:01:13' },
  { sideNumber: '2522', line: '17', lat: 51.12551498, lng: 17.04151726, updateDate: '2020-10-01 21:05:09' },
  { sideNumber: '2714', line: '17', lat: 51.07902908, lng: 17.00299835, updateDate: '2020-10-01 21:06:43' },
  { sideNumber: '2544', line: '17', lat: 51.12396622, lng: 17.04208755, updateDate: '2020-10-01 21:18:33' },
  { sideNumber: '3005', line: '20', lat: 51.07867432, lng: 17.00451279, updateDate: '2020-10-01 19:15:36' },
  { sideNumber: '2324', line: '20', lat: 51.07806015, lng: 17.00709724, updateDate: '2020-10-01 19:47:34' },
  { sideNumber: '3017', line: '20', lat: 51.07817078, lng: 17.00731087, updateDate: '2020-10-01 23:20:14' },
  { sideNumber: '2498', line: '20', lat: 51.12407684, lng: 17.04165268, updateDate: '2020-10-01 23:21:59' },
  { sideNumber: '3015', line: '20', lat: 51.07891846, lng: 17.00318909, updateDate: '2020-10-02 0:03:48' },
  { sideNumber: '2922', line: '23', lat: 51.08820724, lng: 17.02896118, updateDate: '2020-10-01 20:04:05' },
  { sideNumber: '2400', line: '23', lat: 51.12505722, lng: 17.04180336, updateDate: '2020-10-01 20:20:02' },
  { sideNumber: '3208', line: '23', lat: 51.08755875, lng: 17.02811241, updateDate: '2020-10-01 23:11:49' },
  { sideNumber: '2726', line: '23', lat: 51.07932663, lng: 17.00508499, updateDate: '2020-10-01 23:56:16' },
  { sideNumber: '3114', line: '31', lat: 51.0788269, lng: 17.00622749, updateDate: '2020-10-01 20:49:15' },
  { sideNumber: '3129', line: '31', lat: 51.07930756, lng: 17.0043087, updateDate: '2020-10-01 21:30:57' },
  { sideNumber: '3101', line: '31', lat: 51.07866669, lng: 17.00465965, updateDate: '2020-10-01 22:06:13' },
  { sideNumber: '3106', line: '31', lat: 51.0787735, lng: 17.00378418, updateDate: '2020-10-01 22:27:42' },
  { sideNumber: '3120', line: '31', lat: 51.07958984, lng: 17.0076828, updateDate: '2020-10-01 23:38:58' },
  { sideNumber: '3108', line: '31', lat: 51.07914734, lng: 17.00587463, updateDate: '2020-10-01 23:41:36' },
  { sideNumber: '3112', line: '31', lat: 51.07963181, lng: 17.00347137, updateDate: '2020-10-01 23:49:09' },
  { sideNumber: '3121', line: '31', lat: 51.07869339, lng: 17.00416756, updateDate: '2020-10-02 2:06:31' },
  { sideNumber: '3125', line: '32', lat: 51.07813263, lng: 17.00725365, updateDate: '2020-10-01 20:58:55' },
  { sideNumber: '3109', line: '32', lat: 51.07853317, lng: 17.00448608, updateDate: '2020-10-01 21:18:44' },
  { sideNumber: '3110', line: '32', lat: 51.07897568, lng: 17.00522423, updateDate: '2020-10-02 1:50:17' },
  { sideNumber: '3104', line: '32', lat: 51.07879257, lng: 17.00424576, updateDate: '2020-10-02 1:57:36' },
  { sideNumber: '3105', line: '32', lat: 51.07876587, lng: 17.00668526, updateDate: '2020-10-02 2:06:37' },
  { sideNumber: '3111', line: '33', lat: 51.07911301, lng: 17.0074501, updateDate: '2020-10-01 19:26:09' },
  { sideNumber: '3008', line: '33', lat: 51.0781517, lng: 17.00720596, updateDate: '2020-10-01 21:17:52' },
  { sideNumber: '3116', line: '33', lat: 51.07830811, lng: 17.00626373, updateDate: '2020-10-01 22:43:32' },
  { sideNumber: '3130', line: '33', lat: 51.07862854, lng: 17.00333595, updateDate: '2020-10-02 1:53:04' },
  { sideNumber: '3003', line: '33', lat: 51.07866669, lng: 17.00507355, updateDate: '2020-10-02 1:58:07' },
  { sideNumber: '3117', line: '33', lat: 51.07919312, lng: 17.0037632, updateDate: '2020-10-02 2:05:44' },
  { sideNumber: '8407', line: '100', lat: 51.14918518, lng: 17.02389908, updateDate: '2020-10-01 20:29:20' },
  { sideNumber: '7354', line: '101', lat: 51.14873886, lng: 17.02243996, updateDate: '2020-10-01 19:52:46' },
  { sideNumber: '7025', line: '101', lat: 51.14611816, lng: 17.02303123, updateDate: '2020-10-02 0:55:47' },
  { sideNumber: '7306', line: '101', lat: 51.14941406, lng: 17.02325439, updateDate: '2020-10-02 1:45:23' },
  { sideNumber: '8461', line: '102', lat: 51.14723206, lng: 17.02316093, updateDate: '2020-10-01 21:55:11' },
  { sideNumber: '8326', line: '102', lat: 51.14900589, lng: 17.02211761, updateDate: '2020-10-02 0:08:19' },
  { sideNumber: '8120', line: '103', lat: 51.14823151, lng: 17.0212841, updateDate: '2020-10-01 22:26:50' },
  { sideNumber: '5610', line: '103', lat: 51.14745331, lng: 17.02357101, updateDate: '2020-10-02 2:06:17' },
  { sideNumber: '7301', line: '104', lat: 51.15029907, lng: 17.02275658, updateDate: '2020-10-01 23:28:45' },
  { sideNumber: '7026', line: '105', lat: 51.14887619, lng: 17.02253723, updateDate: '2020-10-02 2:06:46' },
  { sideNumber: '8455', line: '106', lat: 51.14683914, lng: 17.02249336, updateDate: '2020-10-01 21:19:15' },
  { sideNumber: '5601', line: '106', lat: 51.14686584, lng: 17.02457619, updateDate: '2020-10-02 2:07:02' },
  { sideNumber: '5416', line: '108', lat: 51.1493988, lng: 17.02210045, updateDate: '2020-10-02 2:06:27' },
  { sideNumber: '7417', line: '111', lat: 51.14738846, lng: 17.02207756, updateDate: '2020-10-01 23:31:05' },
  { sideNumber: '5405', line: '111', lat: 51.14984894, lng: 17.0225544, updateDate: '2020-10-02 0:32:40' },
  { sideNumber: '4600', line: '112', lat: 51.07688141, lng: 17.07038689, updateDate: '2020-10-02 2:06:37' },
  { sideNumber: '4611', line: '113', lat: 51.07675552, lng: 17.06979179, updateDate: '2020-10-02 2:05:43' },
  { sideNumber: '4607', line: '113', lat: 51.07714844, lng: 17.07074356, updateDate: '2020-10-02 2:06:31' },
  { sideNumber: '4604', line: '113', lat: 51.0766983, lng: 17.0711956, updateDate: '2020-10-02 2:06:51' },
  { sideNumber: '5427', line: '115', lat: 51.14918518, lng: 17.02172089, updateDate: '2020-10-02 1:56:07' },
  { sideNumber: '7326', line: '115', lat: 51.14906693, lng: 17.02302551, updateDate: '2020-10-02 1:57:08' },
  { sideNumber: '7320', line: '116', lat: 51.14917374, lng: 17.02299118, updateDate: '2020-10-02 1:44:22' },
  { sideNumber: '7030', line: '116', lat: 51.14874268, lng: 17.02245903, updateDate: '2020-10-02 1:57:07' },
  { sideNumber: '8124', line: '116', lat: 51.14835358, lng: 17.02161407, updateDate: '2020-10-02 1:58:58' },
  { sideNumber: '7314', line: '118', lat: 51.14827728, lng: 17.02379417, updateDate: '2020-10-02 1:08:53' },
  { sideNumber: '7033', line: '118', lat: 51.14852524, lng: 17.02178001, updateDate: '2020-10-02 2:06:46' },
  { sideNumber: '8329', line: '119', lat: 51.14900589, lng: 17.02186203, updateDate: '2020-10-02 0:16:59' },
  { sideNumber: '4412', line: '120', lat: 51.07725906, lng: 17.06990242, updateDate: '2020-10-02 1:59:29' },
  { sideNumber: '8315', line: '121', lat: 51.14933014, lng: 17.02252388, updateDate: '2020-10-02 0:22:21' },
  { sideNumber: '5420', line: '122', lat: 51.14941025, lng: 17.02198219, updateDate: '2020-10-02 0:43:51' },
  { sideNumber: '7022', line: '122', lat: 51.14852524, lng: 17.022089, updateDate: '2020-10-02 1:58:38' },
  { sideNumber: '4639', line: '125', lat: 51.07691956, lng: 17.07044411, updateDate: '2020-10-02 1:59:46' },
  { sideNumber: '7335', line: '126', lat: 51.14869308, lng: 17.0207653, updateDate: '2020-10-01 22:56:51' },
  { sideNumber: '8406', line: '126', lat: 51.14920044, lng: 17.02384758, updateDate: '2020-10-02 0:46:58' },
  { sideNumber: '7018', line: '127', lat: 51.14858627, lng: 17.02236366, updateDate: '2020-10-02 0:41:49' },
  { sideNumber: '7304', line: '127', lat: 51.14942551, lng: 17.0232811, updateDate: '2020-10-02 1:44:59' },
  { sideNumber: '7015', line: '127', lat: 51.14871979, lng: 17.02243805, updateDate: '2020-10-02 2:06:06' },
  { sideNumber: '8472', line: '128', lat: 51.14674377, lng: 17.02411079, updateDate: '2020-10-02 0:00:39' },
  { sideNumber: '8314', line: '128', lat: 51.14936066, lng: 17.02258301, updateDate: '2020-10-02 0:06:34' },
  { sideNumber: '8327', line: '128', lat: 51.14906693, lng: 17.02220535, updateDate: '2020-10-02 0:18:55' },
  { sideNumber: '8122', line: '128', lat: 51.14672089, lng: 17.02277184, updateDate: '2020-10-02 1:59:45' },
  { sideNumber: '7416', line: '129', lat: 51.14815521, lng: 17.02198982, updateDate: '2020-10-01 23:04:38' },
  { sideNumber: '5406', line: '129', lat: 51.14833069, lng: 17.02108955, updateDate: '2020-10-01 23:45:52' },
  { sideNumber: '5430', line: '129', lat: 51.14910507, lng: 17.02160454, updateDate: '2020-10-02 1:57:41' },
  { sideNumber: '8342', line: '129', lat: 51.14838028, lng: 17.02168274, updateDate: '2020-10-02 2:06:48' },
  { sideNumber: '7017', line: '130', lat: 51.14865875, lng: 17.02221107, updateDate: '2020-10-02 2:06:36' },
  { sideNumber: '8450', line: '131', lat: 51.1468277, lng: 17.023592, updateDate: '2020-10-01 19:13:19' },
  { sideNumber: '8141', line: '131', lat: 51.1462059, lng: 17.0233326, updateDate: '2020-10-02 0:39:42' },
  { sideNumber: '8136', line: '131', lat: 51.14926529, lng: 17.02355003, updateDate: '2020-10-02 0:56:17' },
  { sideNumber: '4407', line: '133', lat: 51.07717133, lng: 17.06994247, updateDate: '2020-10-02 1:56:22' },
  { sideNumber: '4601', line: '133', lat: 51.07728577, lng: 17.07090759, updateDate: '2020-10-02 1:57:24' },
  { sideNumber: '4411', line: '133', lat: 51.07594681, lng: 17.07045174, updateDate: '2020-10-02 1:57:56' },
  { sideNumber: '4416', line: '133', lat: 51.07627487, lng: 17.07058144, updateDate: '2020-10-02 1:59:50' },
  { sideNumber: '4630', line: '133', lat: 51.07619858, lng: 17.0710125, updateDate: '2020-10-02 2:06:05' },
  { sideNumber: '4406', line: '133', lat: 51.07710266, lng: 17.06994629, updateDate: '2020-10-02 2:06:48' },
  { sideNumber: '8428', line: '134', lat: 51.14614487, lng: 17.02383804, updateDate: '2020-10-01 23:17:23' },
  { sideNumber: '8418', line: '134', lat: 51.14699173, lng: 17.0225811, updateDate: '2020-10-02 1:08:26' },
  { sideNumber: '8309', line: '134', lat: 51.14935303, lng: 17.02265739, updateDate: '2020-10-02 1:59:08' },
  { sideNumber: '8436', line: '136', lat: 51.11578751, lng: 16.96856689, updateDate: '2020-10-01 6:07:52' },
  { sideNumber: '5612', line: '136', lat: 51.14753723, lng: 17.02317429, updateDate: '2020-10-02 1:02:06' },
  { sideNumber: '8127', line: '136', lat: 51.1464386, lng: 17.02310562, updateDate: '2020-10-02 2:05:45' },
  { sideNumber: '5603', line: '136', lat: 51.14701843, lng: 17.02454758, updateDate: '2020-10-02 2:06:37' },
  { sideNumber: '7024', line: '141', lat: 51.14905167, lng: 17.02350044, updateDate: '2020-10-01 21:54:53' },
  { sideNumber: '7325', line: '141', lat: 51.14854813, lng: 17.02097321, updateDate: '2020-10-01 23:09:30' },
  { sideNumber: '7307', line: '142', lat: 51.14595413, lng: 17.02348518, updateDate: '2020-10-01 23:19:10' },
  { sideNumber: '7031', line: '142', lat: 51.14852142, lng: 17.02197838, updateDate: '2020-10-02 2:06:15' },
  { sideNumber: '8307', line: '142', lat: 51.14948654, lng: 17.02288628, updateDate: '2020-10-02 2:07:01' },
  { sideNumber: '7309', line: '143', lat: 51.14936829, lng: 17.02340698, updateDate: '2020-10-02 1:58:15' },
  { sideNumber: '8453', line: '144', lat: 51.11734009, lng: 17.03447342, updateDate: '2020-10-01 22:30:15' },
  { sideNumber: '4641', line: '145', lat: 51.07725143, lng: 17.07071114, updateDate: '2020-10-02 1:59:18' },
  { sideNumber: '4616', line: '145', lat: 51.07678604, lng: 17.07124519, updateDate: '2020-10-02 2:06:59' },
  { sideNumber: '4602', line: '146', lat: 51.07660675, lng: 17.07125664, updateDate: '2020-10-02 2:06:17' },
  { sideNumber: '4503', line: '147', lat: 51.0767746, lng: 17.06983566, updateDate: '2020-10-02 1:22:26' },
  { sideNumber: '8459', line: '148', lat: 51.12258911, lng: 16.92858887, updateDate: '2020-10-01 7:55:21' },
  { sideNumber: '8341', line: '148', lat: 51.14854813, lng: 17.02141953, updateDate: '2020-10-02 1:10:26' },
  { sideNumber: '4619', line: '149', lat: 51.07728577, lng: 17.07075119, updateDate: '2020-10-02 1:57:36' },
  { sideNumber: '4642', line: '149', lat: 51.07691193, lng: 17.07122421, updateDate: '2020-10-02 1:58:09' },
  { sideNumber: '4637', line: '149', lat: 51.07695389, lng: 17.07040787, updateDate: '2020-10-02 1:58:38' },
  { sideNumber: '4623', line: '149', lat: 51.07672882, lng: 17.07120895, updateDate: '2020-10-02 2:06:08' },
  { sideNumber: '4608', line: '149', lat: 51.07666779, lng: 17.07136917, updateDate: '2020-10-02 2:06:17' },
  { sideNumber: '4504', line: '150', lat: 51.14276505, lng: 17.13347626, updateDate: '2020-10-01 23:40:12' },
  { sideNumber: '7345', line: '151', lat: 51.14885712, lng: 17.02267075, updateDate: '2020-10-02 1:59:16' },
  { sideNumber: '5431', line: '151', lat: 51.14913177, lng: 17.02149773, updateDate: '2020-10-02 2:06:27' },
  { sideNumber: '7336', line: '206', lat: 51.10930634, lng: 16.88292122, updateDate: '2020-10-02 2:06:58' },
  { sideNumber: '7356', line: '240', lat: 51.09608078, lng: 17.04066086, updateDate: '2020-10-02 2:07:03' },
  { sideNumber: '5418', line: '241', lat: 51.1481781, lng: 17.02056694, updateDate: '2020-10-02 1:08:23' },
  { sideNumber: '7355', line: '241', lat: 51.15662003, lng: 17.12381554, updateDate: '2020-10-02 1:59:09' },
  { sideNumber: '5409', line: '241', lat: 51.09352112, lng: 16.98071098, updateDate: '2020-10-02 2:06:36' },
  { sideNumber: '5425', line: '242', lat: 51.13375854, lng: 17.10316086, updateDate: '2020-10-02 2:06:57' },
  { sideNumber: '8467', line: '243', lat: 51.14014053, lng: 16.92007256, updateDate: '2020-10-02 2:06:57' },
  { sideNumber: '8302', line: '245', lat: 51.10105515, lng: 17.03639984, updateDate: '2020-10-02 2:06:58' },
  { sideNumber: '8135', line: '245', lat: 51.14921951, lng: 17.02381325, updateDate: '2020-10-02 2:06:59' },
  { sideNumber: '8430', line: '245', lat: 51.17443466, lng: 16.90613747, updateDate: '2020-10-02 2:07:01' },
  { sideNumber: '8439', line: '245', lat: 51.08592987, lng: 17.04678154, updateDate: '2020-10-02 2:07:02' },
  { sideNumber: '5417', line: '246', lat: 51.10029984, lng: 17.02850914, updateDate: '2020-10-02 2:05:43' },
  { sideNumber: '5414', line: '246', lat: 51.10984039, lng: 16.96843719, updateDate: '2020-10-02 2:06:57' },
  { sideNumber: '7410', line: '246', lat: 51.19775009, lng: 16.97470093, updateDate: '2020-10-02 2:07:02' },
  { sideNumber: '5422', line: '247', lat: 51.13917923, lng: 17.03316498, updateDate: '2020-10-02 2:06:35' },
  { sideNumber: '5421', line: '247', lat: 51.08210754, lng: 17.00958061, updateDate: '2020-10-02 2:06:49' },
  { sideNumber: '5410', line: '248', lat: 51.0982132, lng: 17.03099251, updateDate: '2020-10-02 2:06:07' },
  { sideNumber: '5415', line: '248', lat: 51.13555145, lng: 17.0367775, updateDate: '2020-10-02 2:06:48' },
  { sideNumber: '5424', line: '249', lat: 51.0737915, lng: 17.00936127, updateDate: '2020-10-02 2:06:35' },
  { sideNumber: '5438', line: '249', lat: 51.12787247, lng: 16.89764595, updateDate: '2020-10-02 2:06:59' },
  { sideNumber: '5426', line: '249', lat: 51.0627594, lng: 17.03216362, updateDate: '2020-10-02 2:07:02' },
  { sideNumber: '8433', line: '250', lat: 51.14664841, lng: 17.02379799, updateDate: '2020-10-02 1:20:20' },
  { sideNumber: '5434', line: '250', lat: 51.10340118, lng: 17.02724075, updateDate: '2020-10-02 1:59:50' },
  { sideNumber: '5444', line: '251', lat: 51.07513809, lng: 17.00647926, updateDate: '2020-10-02 1:59:49' },
  { sideNumber: '7305', line: '251', lat: 51.10159302, lng: 17.03658867, updateDate: '2020-10-02 2:06:27' },
  { sideNumber: '8402', line: '251', lat: 51.12926102, lng: 17.05667114, updateDate: '2020-10-02 2:06:57' },
  { sideNumber: '8417', line: '253', lat: 51.1197319, lng: 16.99648094, updateDate: '2020-10-02 2:06:37' },
  { sideNumber: '8482', line: '253', lat: 51.09758377, lng: 17.03347588, updateDate: '2020-10-02 2:06:38' },
  { sideNumber: '5611', line: '255', lat: 51.09198761, lng: 17.03122711, updateDate: '2020-10-02 1:59:41' },
  { sideNumber: '8422', line: '255', lat: 51.105793, lng: 17.10514259, updateDate: '2020-10-02 2:07:00' },
  { sideNumber: '5442', line: '257', lat: 51.14878082, lng: 17.02103424, updateDate: '2020-10-02 2:06:17' },
  { sideNumber: '7406', line: '257', lat: 51.1016655, lng: 17.02949524, updateDate: '2020-10-02 2:06:58' },
  { sideNumber: '5440', line: '257', lat: 51.1083107, lng: 17.02683067, updateDate: '2020-10-02 2:07:00' },
  { sideNumber: '5404', line: '259', lat: 51.11209869, lng: 17.13621521, updateDate: '2020-10-02 1:59:30' },
  { sideNumber: '5436', line: '259', lat: 51.07217026, lng: 17.01164436, updateDate: '2020-10-02 2:07:00' },
  { sideNumber: '8145', line: '319', lat: 51.14635849, lng: 17.02318573, updateDate: '2020-10-02 1:57:25' },
  { sideNumber: '8142', line: '602', lat: 51.14632034, lng: 17.02325439, updateDate: '2020-10-02 1:59:50' },
  { sideNumber: '8056', line: '607', lat: 51.14888763, lng: 17.02187157, updateDate: '2020-10-02 1:56:56' },
  { sideNumber: '4617', line: '612', lat: 51.07567978, lng: 17.00760269, updateDate: '2020-10-01 21:33:49' },
  { sideNumber: '4614', line: '612', lat: 51.07696152, lng: 17.07044983, updateDate: '2020-10-02 2:06:18' },
  { sideNumber: '4603', line: '612', lat: 51.07729721, lng: 17.07100296, updateDate: '2020-10-02 2:07:01' },
  { sideNumber: '7329', line: '714', lat: 51.14904404, lng: 17.02301025, updateDate: '2020-10-02 1:05:11' },
  { sideNumber: '5403', line: '714', lat: 51.14987183, lng: 17.02269745, updateDate: '2020-10-02 1:57:24' },
  { sideNumber: '7037', line: '715', lat: 51.1480751, lng: 17.02117538, updateDate: '2020-10-02 1:00:34' },
  { sideNumber: '7308', line: '715', lat: 51.14935684, lng: 17.02322578, updateDate: '2020-10-02 1:59:26' },
  { sideNumber: '2350', line: '0L', lat: 51.12434006, lng: 17.04203987, updateDate: '2020-10-01 20:04:57' },
  { sideNumber: '2546', line: '0L', lat: 51.12477493, lng: 17.03522491, updateDate: '2020-10-01 23:34:23' },
  { sideNumber: '2430', line: '0P', lat: 51.12387848, lng: 17.04070091, updateDate: '2020-10-01 20:20:13' },
  { sideNumber: '5401', line: 'A', lat: 51.14782333, lng: 17.02328682, updateDate: '2020-10-02 1:23:31' },
  { sideNumber: '8475', line: 'C', lat: 51.13315201, lng: 16.97406197, updateDate: '2020-10-01 17:50:34' },
  { sideNumber: '8339', line: 'C', lat: 51.14860916, lng: 17.02145767, updateDate: '2020-10-01 22:39:39' },
  { sideNumber: '8311', line: 'C', lat: 51.14941406, lng: 17.02269936, updateDate: '2020-10-02 1:56:55' },
  { sideNumber: '5609', line: 'C', lat: 51.14713287, lng: 17.02427483, updateDate: '2020-10-02 1:59:31' },
  { sideNumber: '8332', line: 'D', lat: 51.14632416, lng: 17.02288818, updateDate: '2020-10-01 23:08:28' },
  { sideNumber: '8334', line: 'D', lat: 51.14664459, lng: 17.02370071, updateDate: '2020-10-02 0:25:14' },
  { sideNumber: '8331', line: 'D', lat: 51.14884186, lng: 17.0218544, updateDate: '2020-10-02 0:50:28' },
  { sideNumber: '8333', line: 'D', lat: 51.14878845, lng: 17.02174759, updateDate: '2020-10-02 0:51:12' },
  { sideNumber: '8335', line: 'D', lat: 51.14873505, lng: 17.02166367, updateDate: '2020-10-02 1:00:04' },
  { sideNumber: '7334', line: 'D', lat: 51.14654922, lng: 17.02256012, updateDate: '2020-10-02 1:20:28' },
  { sideNumber: '7310', line: 'K', lat: 51.14932251, lng: 17.02320099, updateDate: '2020-10-02 1:47:25' },
  { sideNumber: '5604', line: 'N', lat: 51.14699936, lng: 17.02448273, updateDate: '2020-10-02 2:06:16' },
];
