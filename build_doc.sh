#!/bin/bash

rm -rf doc/*
php ~/prg/phpdoc/phpDocumentor.phar run --config phpdoc.xml --title "SES Dashboard" --defaultpackagename "ses-dashboard"
rm -rf doc_parser
