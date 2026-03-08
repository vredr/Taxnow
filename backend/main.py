"""
TaxNow - GST Automation Platform
FastAPI Backend
"""

import os
import uuid
import shutil
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

# Import services
try:
    from services.data_processing import DataProcessor
    from services.gst_engine import GSTEngine
    from services.return_generator import ReturnGenerator
    from adapters import get_adapter
    SERVICES_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Services import error: {e}")
    SERVICES_AVAILABLE = False

# Create FastAPI app
app = FastAPI(
    title="TaxNow API",
    description="GST Automation Platform API for E-commerce Data",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory
TEMP_DIR = Path("/tmp/taxnow")
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Initialize services
if SERVICES_AVAILABLE:
    data_processor = DataProcessor()
    gst_engine = GSTEngine()
    return_generator = ReturnGenerator()
else:
    data_processor = None
    gst_engine = None
    return_generator = None

# In-memory storage
processed_data_store: Dict[str, Any] = {}
purchase_data_store: Dict[str, Any] = {}


# ==================== Health & Info Endpoints ====================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "TaxNow API",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "services_available": SERVICES_AVAILABLE
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "data_processor": data_processor is not None,
            "gst_engine": gst_engine is not None,
            "return_generator": return_generator is not None
        },
        "storage": {
            "temp_dir": str(TEMP_DIR),
            "temp_dir_exists": TEMP_DIR.exists(),
            "processed_sales": len(processed_data_store),
            "processed_purchases": len(purchase_data_store)
        }
    }


@app.get("/platforms")
async def get_platforms():
    """Get list of supported e-commerce platforms"""
    return {
        "platforms": [
            {"id": "amazon", "name": "Amazon", "icon": "shopping-cart"},
            {"id": "flipkart", "name": "Flipkart", "icon": "shopping-bag"},
            {"id": "meesho", "name": "Meesho", "icon": "package"},
            {"id": "myntra", "name": "Myntra", "icon": "shirt"},
            {"id": "glowroad", "name": "GlowRoad", "icon": "store"},
            {"id": "jiomart", "name": "JioMart", "icon": "shopping-basket"},
            {"id": "ajio", "name": "Ajio", "icon": "tag"},
            {"id": "limeroad", "name": "LimeRoad", "icon": "shopping-bag"},
            {"id": "shopify", "name": "Shopify", "icon": "globe"},
            {"id": "generic", "name": "Generic CSV/Excel", "icon": "file-spreadsheet"}
        ]
    }


@app.get("/gst-returns")
async def get_gst_returns():
    """Get list of supported GST return types"""
    return {
        "returns": [
            {
                "id": "gstr1",
                "name": "GSTR-1",
                "description": "Monthly/Quarterly return for outward supplies",
                "frequency": "Monthly/Quarterly",
                "due_date": "11th/13th of next month"
            },
            {
                "id": "gstr3b",
                "name": "GSTR-3B",
                "description": "Monthly summary return",
                "frequency": "Monthly",
                "due_date": "20th of next month"
            },
            {
                "id": "gstr4",
                "name": "GSTR-4",
                "description": "Annual return for composition dealers",
                "frequency": "Annual",
                "due_date": "30th April"
            },
            {
                "id": "gstr5",
                "name": "GSTR-5",
                "description": "Return for non-resident taxable persons",
                "frequency": "Monthly",
                "due_date": "20th of next month"
            },
            {
                "id": "gstr6",
                "name": "GSTR-6",
                "description": "Return for input service distributors",
                "frequency": "Monthly",
                "due_date": "13th of next month"
            },
            {
                "id": "gstr7",
                "name": "GSTR-7",
                "description": "Return for TDS deductors",
                "frequency": "Monthly",
                "due_date": "10th of next month"
            },
            {
                "id": "gstr8",
                "name": "GSTR-8",
                "description": "Return for e-commerce operators",
                "frequency": "Monthly",
                "due_date": "10th of next month"
            },
            {
                "id": "gstr9",
                "name": "GSTR-9",
                "description": "Annual return",
                "frequency": "Annual",
                "due_date": "31st December"
            }
        ]
    }


# ==================== Upload Endpoints ====================

@app.post("/upload")
async def upload_file(
    platform: str = Query("generic", description="E-commerce platform"),
    data_type: str = Query("sales", description="Data type: sales or purchase"),
    file: UploadFile = File(...)
):
    """Upload Excel or CSV dataset for GST processing"""
    if not SERVICES_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Services not available. Please check server logs."
        )
    
    if data_type not in ['sales', 'purchase']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="data_type must be 'sales' or 'purchase'"
        )
    
    try:
        allowed_extensions = {'.xlsx', '.xls', '.csv'}
        file_ext = Path(file.filename).suffix.lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type '{file_ext}'. Allowed: {', '.join(allowed_extensions)}"
            )
        
        upload_id = str(uuid.uuid4())
        temp_path = TEMP_DIR / f"{upload_id}{file_ext}"
        
        try:
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}"
            )
        finally:
            file.file.close()
        
        # Read the file
        try:
            df = data_processor.read_file(str(temp_path), file_ext)
        except Exception as e:
            if temp_path.exists():
                temp_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to read file: {str(e)}"
            )
        
        # Get platform adapter and transform data
        try:
            adapter = get_adapter(platform)
            df = adapter.transform(df)
            validation = adapter.validate(df)
        except Exception as e:
            if temp_path.exists():
                temp_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to transform data: {str(e)}"
            )
        
        if not validation["valid"]:
            if temp_path.exists():
                temp_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required columns: {', '.join(validation['missing'])}"
            )
        
        # Remove duplicates
        df = data_processor.remove_duplicates(df)
        
        # Process based on data type
        if data_type == 'sales':
            df = gst_engine.classify_invoices(df)
            df = gst_engine.calculate_gst(df)
            processed_data_store[upload_id] = {
                "dataframe": df,
                "filename": file.filename,
                "platform": platform,
                "upload_time": datetime.now().isoformat(),
                "row_count": len(df)
            }
        else:  # purchase
            df = gst_engine.calculate_itc(df)
            purchase_data_store[upload_id] = {
                "dataframe": df,
                "filename": file.filename,
                "platform": platform,
                "upload_time": datetime.now().isoformat(),
                "row_count": len(df)
            }
        
        # Clean up temp file
        if temp_path.exists():
            temp_path.unlink()
        
        return {
            "success": True,
            "upload_id": upload_id,
            "data_type": data_type,
            "platform": platform,
            "message": "File processed successfully",
            "rows_processed": len(df),
            "columns_detected": list(df.columns),
            "preview": df.head(5).to_dict(orient='records')
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Upload error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# Legacy upload endpoint for backward compatibility
@app.post("/upload/{data_type}")
async def upload_file_legacy(
    data_type: str,
    platform: str = Query("generic", description="E-commerce platform"),
    file: UploadFile = File(...)
):
    """Legacy upload endpoint - redirects to new endpoint"""
    return await upload_file(platform=platform, data_type=data_type, file=file)


# ==================== Summary Endpoints ====================

@app.get("/summary/{upload_id}")
async def get_summary(upload_id: str):
    """Get GST summary statistics for processed sales data"""
    if not SERVICES_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Services not available"
        )
    
    if upload_id not in processed_data_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload ID not found. Please upload a file first."
        )
    
    try:
        data = processed_data_store[upload_id]
        df = data["dataframe"]
        summary = gst_engine.generate_summary(df)
        
        return {
            "success": True,
            "upload_id": upload_id,
            "filename": data["filename"],
            "platform": data.get("platform", "unknown"),
            "summary": summary
        }
        
    except Exception as e:
        import traceback
        print(f"Summary error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )


@app.get("/purchase-summary/{upload_id}")
async def get_purchase_summary(upload_id: str):
    """Get ITC summary for processed purchase data"""
    if not SERVICES_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Services not available"
        )
    
    if upload_id not in purchase_data_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload ID not found. Please upload purchase data first."
        )
    
    try:
        data = purchase_data_store[upload_id]
        df = data["dataframe"]
        summary = gst_engine.generate_itc_summary(df)
        
        return {
            "success": True,
            "upload_id": upload_id,
            "filename": data["filename"],
            "platform": data.get("platform", "unknown"),
            "summary": summary
        }
        
    except Exception as e:
        import traceback
        print(f"Purchase summary error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate purchase summary: {str(e)}"
        )


@app.get("/net-gst-payable")
async def get_net_gst_payable(
    sales_upload_id: str = Query(..., description="Sales data upload ID"),
    purchase_upload_id: str = Query(..., description="Purchase data upload ID")
):
    """Calculate net GST payable after ITC"""
    if not SERVICES_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Services not available"
        )
    
    if sales_upload_id not in processed_data_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sales upload ID not found."
        )
    
    if purchase_upload_id not in purchase_data_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase upload ID not found."
        )
    
    try:
        sales_df = processed_data_store[sales_upload_id]["dataframe"]
        purchase_df = purchase_data_store[purchase_upload_id]["dataframe"]
        
        sales_summary = gst_engine.generate_summary(sales_df)
        purchase_summary = gst_engine.generate_itc_summary(purchase_df)
        
        net_payable = gst_engine.calculate_net_gst_payable(sales_summary, purchase_summary)
        
        return {
            "success": True,
            "sales_upload_id": sales_upload_id,
            "purchase_upload_id": purchase_upload_id,
            "net_gst_payable": net_payable
        }
        
    except Exception as e:
        import traceback
        print(f"Net GST payable error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate net GST payable: {str(e)}"
        )


# ==================== Download Endpoints ====================

@app.get("/download/{return_type}/{upload_id}")
async def download_gst_return(
    return_type: str,
    upload_id: str,
    format: str = Query("excel", description="Output format: excel, csv, json")
):
    """Download generated GST return file"""
    if not SERVICES_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Services not available"
        )
    
    if upload_id not in processed_data_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload ID not found. Please upload a file first."
        )
    
    try:
        data = processed_data_store[upload_id]
        df = data["dataframe"]
        
        if return_type == 'gstr1':
            if format == 'excel':
                output_path = TEMP_DIR / f"gstr1_return_{upload_id}.xlsx"
                return_generator.generate_gstr1(df, str(output_path))
                filename = "gstr1_return.xlsx"
                media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            elif format == 'csv':
                output_path = TEMP_DIR / f"gstr1_return_{upload_id}.csv"
                return_generator.generate_csv(df, str(output_path))
                filename = "gstr1_return.csv"
                media_type = "text/csv"
            elif format == 'json':
                output_path = TEMP_DIR / f"gstr1_return_{upload_id}.json"
                return_generator.generate_json(df, str(output_path))
                filename = "gstr1_return.json"
                media_type = "application/json"
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid format. Use 'excel', 'csv', or 'json'"
                )
        elif return_type == 'gstr3b':
            output_path = TEMP_DIR / f"gstr3b_return_{upload_id}.xlsx"
            purchase_df = pd.DataFrame()
            return_generator.generate_gstr3b(df, purchase_df, str(output_path))
            filename = "gstr3b_return.xlsx"
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        elif return_type == 'gstr4':
            output_path = TEMP_DIR / f"gstr4_return_{upload_id}.xlsx"
            return_generator.generate_gstr4(df, str(output_path))
            filename = "gstr4_return.xlsx"
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        elif return_type == 'gstr9':
            output_path = TEMP_DIR / f"gstr9_return_{upload_id}.xlsx"
            purchase_df = pd.DataFrame()
            return_generator.generate_gstr9(df, purchase_df, str(output_path))
            filename = "gstr9_return.xlsx"
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid return type: {return_type}"
            )
        
        if not output_path.exists():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate {return_type.upper()} file"
            )
        
        return FileResponse(
            path=str(output_path),
            filename=filename,
            media_type=media_type
        )
        
    except Exception as e:
        import traceback
        print(f"Download error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate download: {str(e)}"
        )


# Legacy download endpoint for backward compatibility
@app.get("/download/{upload_id}")
async def download_gst_return_legacy(
    upload_id: str,
    format: str = Query("excel", description="Output format: excel, csv, json")
):
    """Legacy download endpoint - defaults to GSTR-1"""
    return await download_gst_return(return_type="gstr1", upload_id=upload_id, format=format)


@app.get("/download-sample")
async def download_sample():
    """Download sample dataset for testing"""
    sample_csv_content = """invoice_number,invoice_date,customer_gstin,place_of_supply,hsn_code,tax_rate,taxable_value,quantity,supplier_state
INV001,2024-01-15,27AAPFU0939F1ZV,Maharashtra,8517,18,50000,10,Maharashtra
INV002,2024-01-16,29AAGCM1234P1ZT,Karnataka,8517,18,75000,15,Maharashtra
INV003,2024-01-17,,Maharashtra,8471,18,2500,2,Maharashtra
INV004,2024-01-18,07AAACR5055K1ZG,Delhi,8528,28,300000,5,Maharashtra
INV005,2024-01-19,,Tamil Nadu,8517,18,180000,8,Maharashtra
INV006,2024-01-20,33AAHCP7890N1ZF,Tamil Nadu,8471,18,95000,12,Maharashtra
INV007,2024-01-21,,Maharashtra,8528,28,15000,3,Maharashtra
INV008,2024-01-22,24AAACR1234L1ZG,Gujarat,8517,18,450000,20,Maharashtra
INV009,2024-01-23,,Karnataka,8471,18,220000,6,Maharashtra
INV010,2024-01-24,27AAGCP5678Q1ZR,Maharashtra,8528,28,85000,4,Maharashtra
"""
    return PlainTextResponse(
        content=sample_csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sample_sales_data.csv"}
    )


# ==================== Invoice Management Endpoints ====================

@app.get("/invoices/{upload_id}")
async def get_invoices(
    upload_id: str,
    invoice_type: Optional[str] = Query(None, description="Filter by invoice type: B2B, B2CL, B2CS, EXPORT"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100)
):
    """Get paginated list of invoices"""
    if upload_id not in processed_data_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload ID not found."
        )
    
    try:
        df = processed_data_store[upload_id]["dataframe"]
        
        # Filter by invoice type if specified
        if invoice_type:
            df = df[df['invoice_type'] == invoice_type.upper()]
        
        # Pagination
        total = len(df)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        paginated_df = df.iloc[start_idx:end_idx]
        
        # Convert to dict
        records = paginated_df.to_dict(orient='records')
        
        # Format date
        for record in records:
            if 'invoice_date' in record and record['invoice_date'] is not None:
                if hasattr(record['invoice_date'], 'strftime'):
                    record['invoice_date'] = record['invoice_date'].strftime('%d-%m-%Y')
        
        return {
            "success": True,
            "upload_id": upload_id,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
            "invoices": records
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch invoices: {str(e)}"
        )


@app.get("/analytics/{upload_id}")
async def get_analytics(upload_id: str):
    """Get detailed analytics for the uploaded data"""
    if upload_id not in processed_data_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload ID not found."
        )
    
    try:
        df = processed_data_store[upload_id]["dataframe"]
        summary = gst_engine.generate_summary(df)
        
        # Additional analytics
        analytics = {
            "summary": summary,
            "charts": {
                "tax_distribution": [
                    {"name": "CGST", "value": summary['overall']['total_cgst']},
                    {"name": "SGST", "value": summary['overall']['total_sgst']},
                    {"name": "IGST", "value": summary['overall']['total_igst']}
                ],
                "invoice_type_distribution": [
                    {"name": inv_type, "value": data['invoice_count']}
                    for inv_type, data in summary['by_type'].items()
                ],
                "monthly_trend": summary.get('monthly_summary', [])
            },
            "top_states": sorted(
                summary.get('state_summary', []),
                key=lambda x: x['taxable_value'],
                reverse=True
            )[:5],
            "top_hsn": sorted(
                summary.get('hsn_summary', []),
                key=lambda x: x['taxable_value'],
                reverse=True
            )[:5]
        }
        
        return {
            "success": True,
            "upload_id": upload_id,
            "analytics": analytics
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate analytics: {str(e)}"
        )


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
