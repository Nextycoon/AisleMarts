# FastAPI Deployment Instructions

## Local Testing with Uvicorn

1. **Install Uvicorn**: If you haven't already, install Uvicorn using pip:
   ```bash
   pip install uvicorn
   ```

2. **Run the FastAPI apps**: You can run each service using Uvicorn. Here are the commands for both services:

   For `auth.py`:
   ```bash
   uvicorn apps.api.auth:app --host 0.0.0.0 --port 8000 --reload
   ```

   For `other_service.py`:
   ```bash
   uvicorn apps.api.other_service:app --host 0.0.0.0 --port 8001 --reload
   ```

   The `--reload` option is useful during development as it will automatically reload the application when you make changes to the code.

## Deployment Instructions for Production Environments

1. **Install Uvicorn and Gunicorn**: For production environments, it's recommended to use a combination of Uvicorn with Gunicorn. Install them via pip:
   ```bash
   pip install uvicorn gunicorn
   ```

2. **Run Services with Gunicorn**: You can run each service using Gunicorn along with Uvicorn workers. Here are the commands for both services:

   For `auth.py`:
   ```bash
   gunicorn apps.api.auth:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

   For `other_service.py`:
   ```bash
   gunicorn apps.api.other_service:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
   ```

   - `-w 4` specifies the number of worker processes. You can adjust this based on the number of CPU cores available.
   - `--bind` specifies the host and port.

3. **Reverse Proxy Setup (Optional)**: In production, it's common to place a reverse proxy (like Nginx) in front of your Uvicorn server. This allows you to handle HTTPS and manage traffic more effectively.

4. **Environment Configuration**: Ensure that your application is configured to handle production settings, such as database connections, environment variables, and logging.

5. **Monitoring and Logging**: Set up monitoring (like Prometheus) and logging (like ELK Stack) to ensure your application runs smoothly in production.
