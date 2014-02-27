#!/bin/bash

withError=$1

echo "hello"

if [[ ! -z ${withError} ]]; then
    echo "example of error" 1>&2
fi