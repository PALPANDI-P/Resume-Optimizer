# ResumeForge - Troubleshooting Guide

## Common Error Messages and Their Fixes

### **"Failed to generate resumes. Make sure the backend server is running."**

**Cause**: Backend server is not running or not accessible.

**Fix**:
1. Verify backend is running on port 5000:
   ```bash
   netstat -ano | findstr :5000
   ```
2. Check backend logs in `backend_err.txt` and `backend_out.txt`
3. Restart backend using `START_BACKEND.bat` or `START_ALL.bat`

---

### **"Connection refused" or "Network Error"**

**Cause**: Frontend cannot reach the backend API.

**Fix**:
1. **Check CORS configuration** - Backend allows:
   - `http://localhost:5173`
   - `http://127.0.0.1:5000`
   - `http://localhost:5174`

2. **Verify API_BASE in frontend** (`src/App.jsx:9`):
   ```javascript
   const API_BASE = 'http://127.0.0.1:5000';
   ```

3. **Test backend directly**:
   ```bash
   curl -X POST http://localhost:5000/api/generate-resumes -F "resume=@test.pdf" -F "jd_text=test"
   ```

---

### **"Port 5000 already in use" / "Port 5173 already in use"**

**Cause**: Another application is using the required port.

**Fix**:
1. Find process using the port:
   ```bash
   netstat -ano | findstr :5000
   ```
   Note the PID (last column).

2. Kill the process:
   ```bash
   taskkill /PID <PID> /F
   ```

3. **Or change ports**:
   - Backend port: Edit `backend\app.py:114` → `app.run(debug=True, port=5001)`
   - Frontend port: Edit `package.json` → `"dev": "vite --port 5174"`
   - Update `API_BASE` in `src/App.jsx` accordingly

---

### **CORS Errors in Browser Console**

**Error**: `Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Fix**:
1. Ensure `flask-cors` is installed:
   ```bash
   cd backend
   venv\Scripts\activate
   pip install flask-cors
   ```

2. Verify CORS config in `backend\app.py:13-15`:
   ```python
   frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
   CORS(app, origins=[frontend_url, 'http://127.0.0.1:5173', 'http://localhost:5174'])
   ```

3. Restart the backend server after changes.

---

### **"File too large. Maximum size is 10MB."**

**Cause**: Uploaded file exceeds 10MB limit.

**Fix**:
1. Compress the PDF/DOCX file
2. Or increase limit in `backend\app.py:17`:
   ```python
   MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB
   ```

---

### **"Invalid or corrupted PDF file."**

**Cause**: PDF is password-protected, scanned image, or corrupted.

**Fix**:
1. Ensure PDF is not password-protected
2. Convert scanned PDF to text-based PDF
3. Try uploading as DOCX or TXT instead

---

## How to Verify Both Servers Are Running

### **Method 1: Check Process List**
```bash
# Backend (Python/Flask)
tasklist | findstr python

# Frontend (Node/Vite)
tasklist | findstr node
```

### **Method 2: Test Ports**
```bash
# Backend port 5000
curl http://localhost:5000/api/generate-resumes -X POST

# Frontend port 5173
curl http://localhost:5173
```

### **Method 3: Use CHECK_STATUS.bat**
```bash
CHECK_STATUS.bat
```
This script checks both ports and reports status.

### **Method 4: System Tray**
Look for CMD windows titled:
- **ResumeForge Backend**
- **ResumeForge Frontend**

---

## How to Check Browser Console for Errors

### **Open Developer Tools**
- **Chrome/Edge**: `Ctrl + Shift + I` or `F12`
- **Firefox**: `Ctrl + Shift + K`

### **Check Console Tab**
1. Look for red error messages
2. Common errors:
   - `Failed to fetch` → Backend not running
   - `CORS` → CORS misconfiguration
   - `413 (Payload Too Large)` → File exceeds 10MB
   - `404 (Not Found)` → Wrong API endpoint

### **Check Network Tab**
1. Open **Network** tab in DevTools
2. Perform a resume upload
3. Look for failed requests (red status):
   - Click request → **Headers** → see full error
   - Click **Response** → see backend error message
   - Click **Timing** → see if request timed out

### **Filter Network Requests**
- Filter by `api/generate-resumes` or `api/download`
- Check `Status` column for `200` (success) vs `4xx/5xx` (errors)

---

## Port Conflict Resolution

### **Step-by-Step Port Cleanup**

1. **Check which ports are in use**:
   ```bash
   netstat -ano | findstr LISTENING | findstr ":5000\|:5173"
   ```

2. **Identify the process**:
   ```bash   tasklist | findstr <PID>
   ```

3. **Kill the process**:
   ```bash
   taskkill /PID <PID> /F
   ```

4. **Reserve ports permanently** (optional):
   - Use `netsh` to reserve ports for your app only

5. **Change application ports** if conflict persists:
   - Backend: Edit `backend\app.py:114`
   - Frontend: Edit `vite.config.js`:
     ```javascript
     export default defineConfig({
       server: { port: 5174 }
     })
     ```
   - Update `API_BASE` in `src/App.jsx`

---

## CORS Issues and How to Fix Them

### **Understanding CORS**
CORS (Cross-Origin Resource Sharing) prevents browsers from making requests between different domains/ports.

### **Current CORS Setup**
Backend (`backend\app.py:13-15`) allows:
```python
CORS(app, origins=[
  'http://localhost:5173',   # Frontend dev server
  'http://127.0.0.1:5173',  # Alternative localhost
  'http://localhost:5174'    # Alternate frontend port
])
```

### **Fix CORS Errors**

#### **Option 1: Use Matching Ports**
Ensure frontend runs on allowed port:
```bash
# Frontend defaults to 5173 (allowed)
npm run dev

# If using 5174, add to CORS whitelist
```

#### **Option 2: Allow All Origins (Development Only)**
Edit `backend\app.py:15`:
```python
CORS(app, origins="*")  # ⚠️ Don't use in production
```

#### **Option 3: Environment Variable**
Set `FRONTEND_URL` before starting backend:
```bash
set FRONTEND_URL=http://localhost:5173
cd backend
venv\Scripts\activate
python app.py
```

#### **Option 4: Preflight Request Handling**
For complex requests (with custom headers), Flask-CORS handles OPTIONS automatically. If errors persist, add:
```python
@app.route('/api/generate-resumes', methods=['OPTIONS'])
def options_generate():
    return '', 204
```

---

## Additional Debugging Tips

### **Backend Logs**
Check real-time logs:
```bash
# Backend output
type backend_out.txt
type backend_err.txt

# Or tail while running
powershell -Command "Get-Content backend_out.txt -Wait"
```

### **Frontend Logs**
```bash
type frontend_out.txt
type frontend_err.txt
```

### **Clear Logs Before Testing**
```bash
cd backend
del /Q backend_out.txt backend_err.txt 2>nul
cd ..
del /Q frontend_out.txt frontend_err.txt 2>nul
```

### **Restart Everything Cleanly**
```bash
# Kill all processes
taskkill /IM python.exe /F 2>nul
taskkill /IM node.exe /F 2>nul

# Delete log files
del /Q backend_out.txt backend_err.txt 2>nul
del /Q frontend_out.txt frontend_err.txt 2>nul

# Run startup script
START_ALL.bat
```

### **Enable Backend Debug Mode**
Backend already runs with `debug=True` (`backend\app.py:114`). Check logs for:
- Incoming requests
- Processing errors
- Stack traces

### **Test with cURL**
```bash
# Simple connectivity test
curl http://localhost:5000/api/generate-resumes

# Full test with sample file
curl -X POST http://localhost:5000/api/generate-resumes \
  -F "resume=@backend\test_docx.docx" \
  -F "jd_text=Software Engineer needed"
```

---

## Still Stuck?

1. Check `README.md` for quick start guide
2. Review `QUICKSTART.md` for setup instructions
3. Verify Python 3.8+ and Node.js 18+ are installed
4. Ensure all dependencies installed:
   ```bash
   cd backend && pip install -r requirements.txt
   npm install
   ```
