FROM nginx:alpine
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
COPY index.html privacy.html terms.html the-agentic-ai-leap.ics og-image.png favicon.png apple-touch-icon.png /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY img /usr/share/nginx/html/img
RUN chmod -R a+rX /usr/share/nginx/html && find /usr/share/nginx/html -type f -exec chmod 644 {} +
EXPOSE 80
