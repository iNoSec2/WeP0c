.PHONY: inspect-db virtualenv dev prod test

create-db:
	alembic init db
	alembic upgrade head

start-db:
	docker-compose up -d 

inspect-db:
    alembic current

virtualenv:
    python3 -m venv venv
    . venv/bin/activate && pip install -r requirements.txt

dev: virtualenv
    . venv/bin/activate && uvicorn app.main:app --reload

prod: virtualenv
    . venv/bin/activate && alembic upgrade head
    . venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000

test: virtualenv
    . venv/bin/activate && pytest

clean:
    rm -rf venv