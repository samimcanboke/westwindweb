FROM python:3.9

WORKDIR /app

RUN apt-get update && apt-get install -y libreoffice

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install pillow 


COPY . .

RUN ls

CMD [ "python", "/app/main.py" ]