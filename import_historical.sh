#!/bin/bash

time php artisan energy-stat:csv-import -d test_data/ftp.mesacounty.us/Courthouse_001EC6051AE4 mc_courthouse && time php artisan energy-stat:csv-import -d test_data/ftp.mesacounty.us/Mesa_County_Fleet_Maintenance_Shop_001EC6051AEB mc_fleet_maintenance && time php artisan energy-stat:csv-import -d test_data/ftp.mesacounty.us/Department_of_Human_Resources_001EC6051AE3_001EC6051AE3 mc_hr_dept && time php artisan energy-stat:csv-import -d test_data/ftp.mesacounty.us/Workforce_Center_001EC6051AE8 mc_workforce
