### Setup

- Create a virtual environment `python -m venv venv`
- Activate the virtual environment `source venv/bin/activate`
- Install project dependencies `pip install -r requirements.txt`
- Run a postgresql database container `docker run --name postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres`
- Run redis docker container `docker run --name redis -p 6379:6379 -d redis `
- Run `flask db upgrade` to apply migration changes

### Development

- (If you did not activate a virtual environment, activate it using `source venv/bin/activate`)
- In a virtual environment activated terminal, run `flask run --debug` to start the server
- In a second virtual environment activated terminal, start Celery worker `celery -A app.celery_app worker --loglevel INFO`
- After any changes to the database models, run `flask db migrate -m "your migration message"` to generate migrations
