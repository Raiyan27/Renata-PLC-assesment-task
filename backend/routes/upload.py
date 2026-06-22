from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from io import BytesIO
from database import init_db

router = APIRouter(prefix="/api")

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    filename = file.filename.lower()
    
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(BytesIO(contents), keep_default_na=False)
        elif filename.endswith(".xlsx"):
            df = pd.read_excel(BytesIO(contents), engine="openpyxl", keep_default_na=False)
        else:
            raise HTTPException(status_code=400, detail="Invalid file type. Only CSV and XLSX are supported.")
        
        # Check if basic columns are roughly there (case insensitive)
        cols = [str(c).upper().strip() for c in df.columns]
        required = ["DAY_DATE", "START", "END", "HOURS", "REASON"]
        missing = [r for r in required if r not in cols]
        
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing)}")

        init_db(df)
        return {"message": "Dataset uploaded and processed successfully."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")

@router.post("/refresh-default")
def refresh_default():
    try:
        init_db(df=None)
        return {"message": "Reset to default dataset successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting dataset: {str(e)}")
