from flask import Flask, jsonify, request
from flask_cors import CORS # type: ignore
import pandas as pd
from google.cloud import firestore

app = Flask(__name__)
CORS(app)

SERVICE_ACCOUNT_KEY_PATH = "/Users/alessandrobondani/Documents/Progetti/Progetti React/FinanceAnalyzer/backend/personal-homebanking-firebase-adminsdk-h4kbi-ad2de5bac3.json"

# Initialize Firestore client explicitly with the credentials
db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH)

@app.route('/upload', methods=['POST'])
def insert_xlsx_file():
    file = request.files['file']

    try:
        # Clean the data using the updated function
        cleaned_data = clean_uploaded_excel(file)

        # Insert data into Firestore
        insert_into_firestore(cleaned_data)

        return jsonify({"message": "Data successfully inserted into Firestore"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def clean_uploaded_excel(file):
    # Load and clean Excel data (as implemented earlier)
    df = pd.read_excel(file, skiprows=10)
    df = df.dropna(axis=1, how="all")
    df.columns = ["Data", "Operazione", "Dettagli", "Conto/Carta", "Contabilizzazione", "Categoria", "Valuta", "Importo"]
    df["Data"] = pd.to_datetime(df["Data"], errors="coerce")
    df["Importo"] = pd.to_numeric(df["Importo"], errors="coerce")
    df = df.dropna(subset=["Data", "Importo"])
    return df


def insert_into_firestore(df):
    """
    Insert cleaned data into Firestore following the structure provided.
    """

    # Group data by month
    df["Year-Month"] = df["Data"].dt.strftime("%Y-%m")
    grouped = df.groupby("Year-Month")

    for year_month, group in grouped:
        # Split into income and outcome based on Importo (positive or negative)
        income = group[group["Importo"] > 0]
        outcome = group[group["Importo"] < 0]

        # Prepare Firestore-compatible structure
        income_records = [
            {
                "amount": row["Importo"],
                "category": row["Categoria"],
                "currency": row["Valuta"],
                "date": row["Data"].strftime("%Y-%m-%dT%H:%M:%S"),
                "label": row["Operazione"],
                "merchant": row["Dettagli"],
            }
            for _, row in income.iterrows()
        ]

        outcome_records = [
            {
                "amount": abs(row["Importo"]),  # Make negative values positive
                "category": row["Categoria"],
                "currency": row["Valuta"],
                "date": row["Data"].strftime("%Y-%m-%dT%H:%M:%S"),
                "label": row["Operazione"],
                "merchant": row["Dettagli"],
            }
            for _, row in outcome.iterrows()
        ]

        # Create or update the Firestore document for the month
        doc_ref = db.collection("transaction").document(year_month)
        doc_ref.set(
            {
                "income": firestore.ArrayUnion(income_records),
                "outcome": firestore.ArrayUnion(outcome_records),
            },
            merge=True,
        )


if __name__ == '__main__':
    app.run(debug=True)