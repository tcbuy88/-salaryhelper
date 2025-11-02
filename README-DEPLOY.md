# Deployment & Local Run Notes

- Use docker-compose-full.yml to start static site (nginx) + prism mock + server stub.
- To run stub only:
  cd server
  pip install -r requirements.txt
  uvicorn app.main:app --reload --port 8000

- For payments testing, use ngrok to expose notify_url for callbacks in sandbox.
