FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install alembic

COPY alembic.ini alembic.ini

COPY ./app ./app

# Add wait-for-it script
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

EXPOSE 8000

# Use wait-for-it to ensure the database is ready before starting the application
CMD /wait-for-it.sh db:5432 -- alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000