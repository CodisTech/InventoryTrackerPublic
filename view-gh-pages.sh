#!/bin/bash

# Create a simple HTTP server for gh-pages content
cd gh-pages
python -m http.server 8080
