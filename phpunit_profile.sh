#!/bin/bash

php -d xdebug.profiler_enable=1 -d xdebug.profiler_output_dir=/var/www/profiler ./phpunit
