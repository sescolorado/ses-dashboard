#!/bin/bash

php artisan migrate:make create_${1}_table --create=$1
php composer dump-autoload
chown -R www-data:www-data *
chmod g+w app/database/migrations/*
