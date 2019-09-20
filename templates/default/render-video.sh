#! /bin/sh

RENDERER=`command -v kdenlive_render`
MELT=`command -v melt`
DIR=`pwd`
VIDEO_TITLE='rendered_video'

if [ ! -z "$1" ]; then
  VIDEO_TITLE=`echo "$1" | tr -s ' ' | tr ' ' '_'`
fi

SOURCE_0="file://$DIR/templates/default/render-video.sh.mlt"
TARGET_0="file://$DIR/templates/default/$VIDEO_TITLE.mp4"
PARAMETERS_0="-pid:8248 in=0 out=1599 $MELT atsc_1080p_25 avformat - $SOURCE_0 $TARGET_0 properties=x264-medium f=mp4 vcodec=libx264 acodec=aac g=120 crf=23 ab=160k preset=faster threads=1 real_time=-1"
$RENDERER $PARAMETERS_0
