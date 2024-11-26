FROM jupyter/pyspark-notebook

ENV PYSPARK_PYTHON=python3
ENV PYSPARK_DRIVER_PYTHON=python3


RUN pip install flask flask-cors
RUN pip install numpy
RUN pip install pyspark

COPY . .

EXPOSE 5000

CMD ["python", "predictions.py"]