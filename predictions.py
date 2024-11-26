# Import required modules
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, DoubleType
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.classification import LinearSVCModel  # Changed to SVM Model
from pyspark.ml.evaluation import MulticlassClassificationEvaluator
from werkzeug.utils import secure_filename
import pyspark.sql.functions as F

# Initialize Flask and CORS
app = Flask(__name__)
CORS(app)

# Initialize Spark session for inference
spark = SparkSession.builder.appName("Inference").getOrCreate()
svm_model = LinearSVCModel.load("weights")  # Changed to SVM Model

# Define schema for incoming CSV data
data_schema = StructType([
    StructField("fixed_acidity", DoubleType()),
    StructField("volatile_acidity", DoubleType()),
    StructField("citric_acid", DoubleType()),
    StructField("residual_sugar", DoubleType()),
    StructField("chlorides", DoubleType()),
    StructField("free_sulfur_dioxide", DoubleType()),
    StructField("total_sulfur_dioxide", DoubleType()),
    StructField("density", DoubleType()),
    StructField("pH", DoubleType()),
    StructField("sulphates", DoubleType()),
    StructField("alcohol", DoubleType()),
    StructField("quality", DoubleType())
])

@app.route("/predict", methods=["POST"])
def make_prediction():
    # Receive and save the uploaded file
    uploaded_file = request.files["file"]
    secure_name = secure_filename(uploaded_file.filename)
    tmp_dir = "/tmp"
    os.makedirs(tmp_dir, exist_ok=True)
    file_path = os.path.join(tmp_dir, secure_name)
    uploaded_file.save(file_path)

    # Process the dataset
    validation_data = spark.read.format("csv").schema(data_schema).options(header=True, delimiter=';', quote='"').load(file_path)
    validation_data = validation_data.withColumn("quality", F.when(F.col("quality") > 7, 1).otherwise(0))
    
    # Feature vectorization
    feature_assembler = VectorAssembler(inputCols=validation_data.columns[:-1], outputCol="features")
    validation_data = feature_assembler.transform(validation_data)

    # Predict using the model
    prediction_results = svm_model.transform(validation_data)  # Changed to SVM Model
    
    # Model evaluation
    evaluator = MulticlassClassificationEvaluator(labelCol="quality", predictionCol="prediction", metricName="f1")
    f1_metric = evaluator.evaluate(prediction_results)

    # Return JSON response
    return jsonify({"f1_score": f1_metric})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)