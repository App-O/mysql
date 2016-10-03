#!/bin/sh

FILENAME=$(basename "$0")
LOCATION="$(cd "$(dirname "$0")" && pwd)"
DATESTAMP=$(date +"%Y-%m-%d-%H-%M")

BACKUP_NAME=mysql-backup-${DATESTAMP}.sql.gz

SRC=${LOCATION}/${BACKUP_NAME}
DST=gs://app-o/mysql/backups/${BACKUP_NAME}

#exec >> ${LOCATION}/logs/${FILENAME%.*}.log
#exec 2>&1

cd ${LOCATION}

echo Backing up database to ${SRC}...
mysqldump --triggers --routines --quick --user root -ppotatismos munch | gzip > ${SRC}

echo Uploading ${SRC} to ${DST}...
gsutil cp ${SRC} ${DST}

echo Cleaning up...
#rm ${SRC}

echo Done.
