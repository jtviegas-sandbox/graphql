#!/bin/sh

this_folder="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
if [ -z "$this_folder" ]; then
  this_folder=$(dirname $(readlink -f $0))
fi


usage() {
  cat <<EOM  
  creates a new graphQl project
  
  usage:
  $(basename $0) <projectName>

EOM
  exit 1
}


[ -z "$1" ] && { usage; }

projectName="$1"

mkdir "$projectName" && cd "$projectName"
npm init -y
npm install -g npm
npm install apollo-server graphql nodemon


