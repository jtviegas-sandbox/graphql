#!/bin/sh

this_folder="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
if [ -z "$this_folder" ]; then
  this_folder=$(dirname $(readlink -f $0))
fi

which node
if [ ! "$?" -eq "0" ]; then echo "!!! please install 'node' !!!" && exit 1; fi

which npm
if [ ! "$?" -eq "0" ]; then echo "!!! please install 'npm' !!!" && exit 1; fi

which amplify
if [ ! "$?" -eq "0" ]; then
    echo "going to install 'amplify'..."
    npm i -g @aws-amplify/cli@0.1.38
    if [ ! "$?" -eq "0" ]; then echo "!!! coud not install 'amplify' !!!" && exit 1; fi
fi

amplify configure
amplify init
amplify add api
amplify push # will build all your local backend resources and provision it in the cloud
# "amplify publish" will build all your local backend and frontend resources
