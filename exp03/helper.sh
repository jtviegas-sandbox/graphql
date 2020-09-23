#!/bin/bash

# http://bash.cumulonim.biz/NullGlob.html
shopt -s nullglob

this_folder="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
if [ -z "$this_folder" ]; then
  this_folder=$(dirname $(readlink -f $0))
fi

debug(){
    local __msg="$1"
    echo " [DEBUG] `date` ... $__msg "
}

info(){
    local __msg="$1"
    echo " [INFO]  `date` ->>> $__msg "
}

warn(){
    local __msg="$1"
    echo " [WARN]  `date` *** $__msg "
}

err(){
    local __msg="$1"
    echo " [ERR]   `date` !!! $__msg "
}

if [ ! -f "$this_folder/variables.inc" ]; then
  warn "we DON'T have a 'variables.inc' file"
else
  . "$this_folder/variables.inc"
fi

if [ ! -f "$this_folder/secrets.inc" ]; then
  warn "we DON'T have a 'secrets.inc' file"
else
  . "$this_folder/secrets.inc"
fi

verify(){
  info "[verify] ..."
  local _r=0

  which aws 1>/dev/null
  if [ ! "$?" -eq "0" ] ; then err "please install aws cli" && return 1; fi

  info "[verify] ...done."
}


installdeps(){
  info "[installdeps] ..."
  _pwd=`pwd`
  cd "$this_folder"
  npm install -g serverless
  if [ ! "$?" -eq "0" ]; then err "[installdeps] could not install serverless" && cd "$_pwd" && return 1; fi
  npm install apollo-server-lambda graphql
  if [ ! "$?" -eq "0" ]; then err "[installdeps] could not install apollo-server-lambda and/or graphql" && cd "$_pwd" && return 1; fi
  cd "$_pwd"
  info "[installdeps] ...done."
}

deploy(){
  info "[deploy] ..."
  _pwd=`pwd`
  cd "$this_folder"
  serverless deploy
  if [ ! "$?" -eq "0" ]; then err "[deploy] failed to deploy using serverless" && cd "$_pwd" && return 1; fi

  cd "$_pwd"
  info "[deploy] ...done."
}

usage() {
  cat <<EOM
  usage:
  $(basename $0) { init | installdeps | deploy }

      - init: configs aws access
      - installdeps: installs dependencies
      - deploy: deploys using serverless framework

EOM
  exit 1
}

verify

debug "1: $1 2: $2 3: $3 4: $4 5: $5 6: $6 7: $7 8: $8 9: $9"


case "$1" in
  init)
    init
    ;;
  installdeps)
    installdeps
    ;;
  deploy)
    deploy
    ;;
  *)
    usage
    ;;
esac