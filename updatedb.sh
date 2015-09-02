#!/bin/bash
# Author: Skyler Ogden
# Email: skyler@sesdashboard.com
# Based on script found here: https://gist.github.com/ekristen/11254304
#
# The script checks if a container is running and closes.
# The script must move processed .csv file to a new location or it will try and re-add them. This will not effect the database but WILL add CPU cycles for additional files"


CONTAINER="ses_app_cron"
loc_name=$1	
loc_dir=$2	# The location is with respect to the ses-dashboard directory NOT the root directory - e.g. /ftp-uploads/<location> not /www/sesdashboard/ftp-uploads/<location>
loc_backup=$3	# File backup location directory - will create if doesn't exist
cur_dir=$(pwd)


if [ $# -eq 0 ]; then
  echo "Usage $0 <location name> <location directory> <backup location>" 
  exit 1	#exit with error
fi

if [ $# -lt 3 ]; then

  if [ -z $1 ]; then
    echo "No location name specified"
  fi
  
  if [ -z $2 ]; then
    echo "No location directory specified"
  fi
  
  if [ -z $3 ]; then
    echo "No backup directory specified"
  fi
  
  echo "Usage $0 <location name> <location directory> <backup location>" 
  exit 1	#exit with error

fi


if [ $# -eq 3 ]; then
  echo "Using <$1> as the location name, <$2> as the location directory and <$3> as the backup location"
fi

# Make sure target directory exits

if [ ! -d "$loc_dir" ]; then
  echo "Target location directory does not exist"
  exit 1
fi

# Check if container is running. If container is running, then stop it and proceed. Otherwise, proceed.
RUNNING=$(docker inspect --format="{{ .State.Running }}" ses_app_cron 2> /dev/null)

if [ "$RUNNING" == "false" ]; then
  echo "$CONTAINER was running, closing now"
  docker rm $CONTAINER 

else	# debugging
  echo "$CONTAINER is not running. Proceeding with database update"
fi

# See if backup folder location exists. Create backup folder if it does not
if [ ! -d "$loc_backup" ]; then
  echo "backup location folder does not exist, creating now"
  mkdir $loc_backup
  
else	# debugging
  echo "backup folder exists, running database update script"
fi


# Run update script
docker run -t -w="/var/www" --volumes-from ses_app --link ses_mysql:mysql --name "ses_app_cron" ses_app php /var/www/artisan energy-stat:csv-import -d $loc_dir $loc_name  
docker rm $CONTAINER
mv $loc_dir/*.csv $loc_backup 2>/dev/null

exit 0	#exit successfully