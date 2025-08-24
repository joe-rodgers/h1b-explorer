import pandas as pd
import json
import os

def convert_parquet_to_json():
    """
    Convert H1B Parquet data to JSON format for web consumption.
    Creates both a sample dataset and full dataset.
    """
    
    # File paths
    parquet_file = r"C:\Projects\h1b\data\outputs\production\H1B_MASTER_DATASET_2009_2025_CORRECTED.parquet"
    
    # Create output directory
    output_dir = "public/data"
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        print(f"Reading Parquet file: {parquet_file}")
        
        # Read the Parquet file
        df = pd.read_parquet(parquet_file)
        
        print(f"Data loaded: {len(df)} rows, {len(df.columns)} columns")
        print(f"Columns: {list(df.columns)}")
        
        # Handle NaN values - replace with appropriate defaults
        df = df.fillna({
            # Numeric columns get 0
            'Line by line': 0,
            'Fiscal Year   ': 0,
            'Tax ID': 0,
            'New Employment Approval': 0,
            'New Employment Denial': 0,
            'Continuation Approval': 0,
            'Continuation Denial': 0,
            'Change with Same Employer Approval': 0,
            'Change with Same Employer Denial': 0,
            'New Concurrent Approval': 0,
            'New Concurrent Denial': 0,
            'Change of Employer Approval': 0,
            'Change of Employer Denial': 0,
            'Amended Approval': 0,
            'Amended Denial': 0,
            'DATA_YEAR': 0,
            # Text columns get empty string
            'Employer (Petitioner) Name': '',
            'Industry (NAICS) Code': '',
            'Petitioner City': '',
            'Petitioner State': '',
            'Petitioner Zip Code': '',
            'Employer (Petitioner) Name_CLEANED': '',
            'SOURCE_FILE': ''
        })
        
        # Create sample dataset (1000 rows)
        sample_df = df.sample(n=min(1000, len(df)), random_state=42)
        
        # Convert to JSON
        sample_data = sample_df.to_dict('records')
        full_data = df.to_dict('records')
        
        # Save sample dataset
        sample_file = os.path.join(output_dir, "h1b_sample.json")
        with open(sample_file, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, indent=2, ensure_ascii=False)
        
        print(f"Sample dataset saved: {sample_file} ({len(sample_data)} rows)")
        
        # Save full dataset
        full_file = os.path.join(output_dir, "h1b_full.json")
        with open(full_file, 'w', encoding='utf-8') as f:
            json.dump(full_data, f, indent=2, ensure_ascii=False)
        
        print(f"Full dataset saved: {full_file} ({len(full_data)} rows)")
        
        # Display some statistics
        print(f"\nDataset Statistics:")
        print(f"- Total records: {len(df):,}")
        print(f"- Sample records: {len(sample_df):,}")
        print(f"- Years covered: {df['Fiscal Year   '].min()} - {df['Fiscal Year   '].max()}")
        print(f"- States: {df['Petitioner State'].nunique()}")
        print(f"- NAICS codes: {df['Industry (NAICS) Code'].nunique()}")
        
    except FileNotFoundError:
        print(f"Error: Parquet file not found at {parquet_file}")
        print("Please ensure the file path is correct and the file exists.")
    except Exception as e:
        print(f"Error converting data: {str(e)}")

if __name__ == "__main__":
    convert_parquet_to_json()
