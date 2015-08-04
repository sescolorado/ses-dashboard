#!/bin/bash

# First check if the ses_app_cron docker container is running. If so, then remove it

CONTAINER="ses_app_cron"

docker rm "$CONTAINER"
# Run all the update scripts in the updatedb folder
run-parts /www/ses-dashboard/updatedb/
