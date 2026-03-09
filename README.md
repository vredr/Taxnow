# TaxNow - GST Automation Platform v2.0

A comprehensive GST automation SaaS platform for Indian businesses to manage GST returns, e-commerce data imports, and tax calculations.

## Live Demo
- **Frontend:** 
- **Backend API:** https://taxnow-production.up.railway.app

## Features

### Platform Support (10+ E-commerce Platforms)
- **Amazon** - Full adapter with GSTIN state extraction
- **Flipkart** - Seller Hub report support
- **Meesho** - Supplier Panel integration
- **Shopify** - Order export processing
- **Myntra, GlowRoad, JioMart, Ajio, LimeRoad** - Generic adapter support
- **Generic CSV/Excel** - Standard format upload

### GST Return Generation (All Major Returns)
- **GSTR-1** - Complete with B2B, B2CL, B2CS, Export, HSN sheets
- **GSTR-3B** - Monthly summary return with ITC
- **GSTR-4** - Composition dealer return
- **GSTR-9** - Annual return
- Export formats: Excel (.xlsx), CSV, JSON

### Dashboard & Analytics
- Real-time GST calculations (CGST, SGST, IGST)
- Tax distribution pie charts
- Monthly sales trends
- State-wise sales analysis
- HSN-wise product analysis
- Invoice type breakdown

### Purchase & ITC Management
- Purchase invoice upload
- Input Tax Credit (ITC) calculation
- Net GST payable calculation
- Supplier-wise ITC summary

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS
- shadcn/ui components
- Recharts for analytics
- React Router for navigation

### Backend
- FastAPI (Python)
- Pandas for data processing
- OpenPyXL for Excel generation
- GST Engine with real tax calculations

## Project Structure

```
Taxnow/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   └── App.tsx        # Main app
│   ├── package.json
│   └── vercel.json        # Vercel deployment config
├── backend/               # FastAPI backend
│   ├── adapters/          # Platform-specific adapters
│   ├── services/          # Business logic
│   ├── main.py           # FastAPI application
│   ├── requirements.txt
│   └── nixpacks.toml     # Railway deployment config
├── railway.toml          # Railway configuration
└── README.md
```

## Getting Started

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Environment Variables
Create a `.env` file in the frontend directory:
```
VITE_API_URL=https://taxnow-production.up.railway.app
```

## GST Calculation Rules

### Invoice Classification
- **B2B** - Invoice with valid customer GSTIN
- **B2CL** - Interstate invoice to unregistered person > ₹2.5L
- **B2CS** - All other B2C invoices (aggregated by state)
- **EXPORT** - Export supplies (zero-rated)

### Tax Calculation
- **Intrastate** (same state): CGST + SGST (split equally)
- **Interstate** (different states): IGST (full tax)
- **Export**: 0% tax

### Input Tax Credit (ITC)
- ITC available only with valid supplier GSTIN
- CGST/SGST ITC for intrastate purchases
- IGST ITC for interstate purchases

## API Endpoints

### Health & Info
- `GET /` - Health check
- `GET /health` - Detailed health status
- `GET /platforms` - List supported platforms
- `GET /gst-returns` - List GST return types

### Upload & Processing
- `POST /upload` - Upload sales/purchase data
- `GET /summary/{upload_id}` - Get sales summary
- `GET /purchase-summary/{upload_id}` - Get purchase summary
- `GET /net-gst-payable` - Calculate net GST payable

### Returns & Downloads
- `GET /download/{return_type}/{upload_id}` - Download GST return
- `GET /download-sample` - Download sample data

### Data Management
- `GET /invoices/{upload_id}` - Get paginated invoices
- `GET /analytics/{upload_id}` - Get detailed analytics

## Deployment

### Backend (Railway)
1. Push code to GitHub
2. Connect Railway to GitHub repository
3. Deploy automatically using nixpacks

### Frontend (Vercel)
1. Push code to GitHub
2. Connect Vercel to GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`

## License

This project is created for educational purposes.

## Support

For support, email support@taxnow.in or create an issue on GitHub.
