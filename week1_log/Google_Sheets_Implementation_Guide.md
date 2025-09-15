# AisleMarts — Week-1 Pilot Log (Google Sheets Implementation Guide)
**Generated:** 2025-09-15T16:33:47.749139Z

This guide provides a copy‑paste structure, formulas, validation rules, and chart steps to build the Week‑1 Kenya Pilot Log in **Google Sheets** in ~10 minutes.

---

## 1) Create Sheets & Names
Create a new Google Sheet with three tabs named exactly:
- `Daily_Log`
- `Week1_Summary`
- `Alert_Candidates`
(Optional) create a fourth hidden tab `Config` to host dropdown lists.

You can import the CSV templates included in this kit:
- `Daily_Log.csv` → into `Daily_Log`
- `Config.csv` → into `Config`

---

## 2) Daily_Log — Columns & Formatting
**Columns A–M (row 1 as headers):**
A: Date — *Format*: `MM/DD/YYYY`  
B: Reviewer — *Data Validation*: List from range `Config!A2` split by `;` **or** paste names and choose List of items  
C: Review_Time — *Data Validation*: List of items: `Morning,Evening` *(or use `Config!B2` split by `;`)*  
D: Total_Orders_24h — Number  
E: MPesa_Success_Rate — Percentage (Format: `##.#%`) *(enter 0.962 for 96.2% or type 96.2%)*  
F: Orders_Pending_4h_Plus — Number  
G: Gross_Revenue_KES — Currency *(Custom format: `KES #,##0`)*  
H: Commission_KES — **Formula** (row 2): `=G2*0.01` then fill down  
I: Anomalies_Issues — *Data Validation*: List of items: `None,Payment Failures,Order Delays,API Errors,Other` *(or use `Config!C2`)*  
J: Seller_Complaints — *Data Validation*: List of items: `Y,N` *(or use `Config!D2`)*  
K: Peak_Hours_Observed — Free text (e.g., `2–4pm, 7–9pm`)  
L: Action_Items — Free text  
M: Notes — Free text  

**Tips**
- Freeze header row 1.  
- Optional: Color the header with brand gradient or dark theme.

---

## 3) Week1_Summary — Formulas (copy into cells)
Place the following labels in **A** and formulas in **B**:

- **A1**: `Week-1 Kenya Pilot Summary` *(bold, larger font)*
- **A3**: `Average M-Pesa Success Rate:`  
  **B3**: `=AVERAGEIF(Daily_Log!E2:E,">0")`
- **A4**: `Average Orders per Day:`  
  **B4**: `=AVERAGEIF(Daily_Log!D2:D,">0")`
- **A5**: `Average Daily Revenue (KES):`  
  **B5**: `=AVERAGEIF(Daily_Log!G2:G,">0")`
- **A6**: `Total Week-1 Commission (KES):`  
  **B6**: `=SUM(Daily_Log!H2:H)`
- **A7**: `Days with Anomalies:`  
  **B7**: `=COUNTIFS(Daily_Log!I2:I,"<>None")`
- **A8**: `Seller Complaints (count):`  
  **B8**: `=COUNTIF(Daily_Log!J2:J,"Y")`

**Optional extras**
- **A10**: `Most Common Order Value Bracket:`  
  **B10**: Use a pivot or `FREQUENCY` buckets (e.g., 0–2k, 2k–5k, 5k–10k, 10k+).  
- **A11**: `Distinct Sellers Touched:` *(if you later capture seller IDs per review)*

---

## 4) Alert_Candidates — Threshold Drafts
Use Week‑1 averages to propose Week‑2 thresholds:

- **A1**: `Alert Thresholds for Week-2` *(bold)*
- **A3**: `M-Pesa Success Rate Below:`  
  **B3**: `=IFERROR(Week1_Summary!B3-0.05, 0.90)`  *(5% below avg; fallback 90%)*
- **A4**: `Orders Pending >4hrs Above:`  
  **B4**: `=IFERROR(PERCENTILE.INC(Daily_Log!F2:F,0.9), 3)`  *(90th percentile; fallback 3)*
- **A5**: `Daily Revenue Drop Below (KES):`  
  **B5**: `=IFERROR(Week1_Summary!B5*0.7, 0)`  *(30% below avg)*

You can color these cells and add notes for Week‑2 tuning.

---

## 5) Data Validation (exact steps in Google Sheets)
1. **Reviewer (B column)** — Data → Data validation → *Criteria*: List of items → enter your names separated by comma **or** reference a range (e.g., `Config!A2:A` after splitting).  
2. **Review_Time (C column)** — List of items: `Morning,Evening`.  
3. **Anomalies_Issues (I column)** — List of items: `None,Payment Failures,Order Delays,API Errors,Other`.  
4. **Seller_Complaints (J column)** — List of items: `Y,N`.  
5. Enable *Show dropdown*; choose *Reject input* for strictness.

*(If using `Config`, paste items in a single cell and use **Data → Split text to columns** with `;` delimiter to expand into rows.)*

---

## 6) Conditional Formatting (recommended)
- **M-Pesa Success Rate (E column):**  
  - Rule 1 (Red): `Format cells if… Less than` → `=Alert_Candidates!B3`  
  - Rule 2 (Green): `Format cells if… Greater than or equal to` → `=Week1_Summary!B3`
- **Orders Pending >4h (F column):**  
  - Rule (Orange): `Format cells if… Greater than` → `=Alert_Candidates!B4`

This keeps Week‑1 visually clean while still highlighting outliers.

---

## 7) Charts (Insert → Chart)
Create three basic charts on **Week1_Summary** or a new `Charts` tab:

1) **M-Pesa Success Trend**  
   - Data range: `Daily_Log!A2:A,Daily_Log!E2:E`  
   - Chart type: Line chart  
   - Format E as percentage.

2) **Daily Order Volume**  
   - Data range: `Daily_Log!A2:A,Daily_Log!D2:D`  
   - Chart type: Column chart.

3) **Revenue Trend (KES)**  
   - Data range: `Daily_Log!A2:A,Daily_Log!G2:G`  
   - Chart type: Column or Line chart  
   - Number format: custom currency `KES #,##0`.

*(If logging both Morning & Evening daily, filter to **Morning** for a clean per‑day series using a filter view or QUERY.)*

---

## 8) Sample Data (for quick testing)
Two sample rows are included in `Daily_Log.csv`. Paste a few more rows during Week‑1 to build your baseline.

---

## 9) Pro Tips
- Create a **Filter View** for Morning entries only to avoid duplicate daily points.  
- Lock formulas in column **H** and protect the header row.  
- At end of Week‑1, **File → Download → CSV** for archive and analysis.  

---

## 10) Next (Week‑2)
- Use `Alert_Candidates` to wire Slack/Email alerts with thresholds calibrated from Week‑1 data.  
- Add seller‑level pivots (leaderboard by GMV/AOV), and hour‑of‑day heatmaps.

**Smarter. Faster. Everywhere.** 🇰🇪
