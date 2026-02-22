FROM beeman/static-server:latest
COPY dist/ /workspace/app/
ENV SPA=true
