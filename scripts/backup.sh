#!/bin/sh

BUCKET=gs://app-o
DATESTAMP=$(date +"%Y.%m.%d.%H.%M")
BACKUP_FILE=mysql.${DATESTAMP}.sql.gz
BUCKET_PATH=mysql/backups
HOME=/home/app_o/mysql/backups

FILENAME=$(basename "$0")
LOCATION="$(cd "$(dirname "$0")" && pwd)"

exec >> ${LOCATION}/logs/${FILENAME%.*}.log
exec 2>&1

cd ${HOME}

echo Backing up database to ${BACKUP_FILE}...
mysqldump --triggers --routines --quick --user root -ppotatismos munch | gzip >  ${BACKUP_FILE}

echo Uploading ${BACKUP_FILE} to ${BUCKET}/${BUCKET_PATH}/${BACKUP_FILE}...
gsutil cp ${BACKUP_FILE}  ${BUCKET}/${BUCKET_PATH}/${BACKUP_FILE}

echo Cleaning up...
rm ${BACKUP_FILE}

echo Done.
