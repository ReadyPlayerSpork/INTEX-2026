# ML notebooks — reproducible execution

Notebooks live under `ml-pipelines/*.ipynb`. Training and serving logic is also mirrored in `ml-pipelines/train.py` and `ml-pipelines/serve.py`.

## Environment

```bash
cd ml-pipelines
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Optional (execute notebooks headlessly):

```bash
pip install nbconvert
jupyter nbconvert --to notebook --execute ml-pipelines/donor_loyalty_pipeline.ipynb --output donor_loyalty_pipeline-executed.ipynb
```

## Clean run checklist

1. **Restart kernel** — clear all variables.
2. **Working directory** — run Jupyter from `ml-pipelines/` so relative paths to CSVs match `serve.py` / `CSV_DIR`.
3. **Data** — with `DATABASE_URL` unset, pipelines fall back to CSVs under `backend/Haven-for-Her-Backend/docs/lighthouse_csv_v7/` (see `serve.py`).
4. **Determinism** — set `random.seed(...)` where sampling occurs (align with `train.py` conventions).

## Notebook structure (rubric-friendly)

Each notebook should have clear sections in order:

1. Problem framing and business question  
2. Target definition  
3. EDA  
4. Preprocessing  
5. Modeling  
6. Evaluation metrics  
7. Interpretation and limitations  
8. Ethics / responsible use  

## Artifacts

`train.py` writes models under `ml-pipelines/models/` and JSON reports alongside. Keep those paths consistent when documenting a class submission.
