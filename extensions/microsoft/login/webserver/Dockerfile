# Dockerfile for Microsoft Login Auth Callback Webserver
FROM nginx:stable-alpine

COPY /static /usr/share/nginx/html
# include the new nginx default config file 
COPY config/nginx/default.conf /etc/nginx/conf.d/