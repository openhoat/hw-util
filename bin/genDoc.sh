#!/bin/bash

this_script_dir=$(cd `dirname $0`;pwd)
base_dir=$(cd ${this_script_dir}/..;pwd)

yuidoc -o ${base_dir}/doc -c ${base_dir}/yuidoc.json ${base_dir}/lib